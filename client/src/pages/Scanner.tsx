import React, { useState, useRef, ReactNode } from "react"
import {
  Button,
  Form,
  Input,
  InputNumber,
  Layout,
  List,
  Progress,
  Row,
  Space,
  Spin,
  Table,
  message,
} from "antd"
import Highlighter from "react-highlight-words"
import { DoubleLeftOutlined, SearchOutlined } from "@ant-design/icons"
import { ApiPromise, WsProvider } from "@polkadot/api"
import "./Scanner.less"
import CustomSpinner from "../components/CustomSpinner"
import { SortOrder } from "antd/lib/table/interface"
import { convertCamelCaseToSentence } from "../utils"

function Scanner(): React.ReactElement {
  const [formEndpoint] = Form.useForm()
  const [formBlocks] = Form.useForm()
  const [selectedEndpoint, setSelectedEndpoint] = useState("")
  const stopScan = useRef(false)
  const [eventsData, setEventsData] = useState<Record<string, unknown>[]>()
  const [loadingPercent, setLoadingPercent] = useState(100)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const api = useRef<ApiPromise>()
  const [isEndpointLoading, setIsEndpointLoading] = useState(false)
  const [isBlockRangeValid, setIsBlockRangeValid] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchedColumn, setSearchedColumn] = useState("")
  const searchInput = useRef<unknown>()

  const handleUseEndpoint = async () => {
    try {
      setIsEndpointLoading(true)
      const newEndpointValue = formEndpoint.getFieldValue("endpoint")
      const provider = new WsProvider(newEndpointValue)

      provider.on("error", () => {
        provider.disconnect()
        api.current = undefined
        setIsEndpointLoading(false)
        setSelectedEndpoint("")
        message.error("An error ocurred when trying to connect to the endpoint")
      })

      // Create the API and wait until ready
      api.current = await ApiPromise.create({ provider })

      // Retrieve the chain & node information information via rpc calls
      const [chain, nodeName, nodeVersion, latestBlock] = await Promise.all([
        api.current.rpc.system.chain(),
        api.current.rpc.system.name(),
        api.current.rpc.system.version(),
        api.current.rpc.chain.getHeader(),
      ])

      setSelectedEndpoint(newEndpointValue)
      formBlocks.setFieldsValue({
        startBlock: undefined,
        endBlock: latestBlock.number.toNumber(),
      })
      setIsBlockRangeValid(false)
      setIsEndpointLoading(false)
    } catch (err) {
      api.current = undefined
      setIsEndpointLoading(false)
      message.error(
        "An error ocurred when trying to get information from the endpoint"
      )
    }
  }

  const handleChangeEndpoint = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault()
    setSelectedEndpoint("")
    setEventsData(undefined)
  }

  const handleStartScanning = async (values: Record<string, number>) => {
    try {
      const { startBlock, endBlock } = values
      const loadingStepSize = 100 / (endBlock - startBlock + 1)
      setEventsData([])
      setLoadingPercent(0)

      // Get end block
      let currentBlockNumber = endBlock
      const endBlockHash = await (
        api.current as ApiPromise
      ).rpc.chain.getBlockHash(endBlock)
      let currentBlock = await (api.current as ApiPromise).rpc.chain.getBlock(
        endBlockHash
      )
      let currentBlockRecords = await (
        api.current as ApiPromise
      ).query.system.events.at(endBlockHash)

      // Keep getting previous block until we reach start block
      while (currentBlockNumber >= startBlock) {
        const newEvents: Record<string, unknown>[] = []
        for (const auxRecords of currentBlockRecords) {
          const { event } = auxRecords
          const types = event.typeDef

          const eventArguments: Record<string, unknown> = {}
          event.data.forEach((data, index) => {
            eventArguments[index] = [
              types[index].type.toString(),
              data.toJSON(),
            ]
          })

          newEvents.push({
            blockNumber: currentBlockNumber,
            eventName: event.method.toString(),
            description: event.meta.docs[0].toString().replace(/\\/g, ""),
            eventArguments, //: JSON.stringify(eventArguments),
          })
        }

        setEventsData(previousValue =>
          (previousValue as Record<string, unknown>[]).concat(newEvents)
        )
        currentBlockNumber -= 1
        setLoadingPercent(previousValue => previousValue + loadingStepSize)
        if (stopScan.current) {
          break
        }
        if (currentBlockNumber >= startBlock) {
          currentBlock = await (api.current as ApiPromise).rpc.chain.getBlock(
            currentBlock.block.header.parentHash
          )
          currentBlockRecords = await (
            api.current as ApiPromise
          ).query.system.events.at(currentBlock.block.header.parentHash)
        }
      }
      stopScan.current = false
      setLoadingPercent(100)
    } catch (err) {
      console.log(err)
      message.error(
        "An error happened when loading the blocks, please check the start and end values."
      )
      setLoadingPercent(100)
    }
  }

  const handleStopScan = async () => {
    stopScan.current = true
  }

  const handleSearch = (
    selectedKeys: string[],
    confirm: () => void,
    fieldName: string
  ) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(fieldName)
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
    setSearchText("")
  }
  const checkBlockRange = (
    changedValues: any,
    values: Record<string, number>
  ) => {
    // Validate that start block is less than or equal to end block
    if (changedValues && Number(values.startBlock) > Number(values.endBlock)) {
      setIsBlockRangeValid(false)
      formBlocks.setFields([
        {
          name: "startBlock",
          value: values.startBlock,
          errors: ["End Block must be less than or equal to Start Block"],
        },
        {
          name: "endBlock",
          value: values.endBlock,
          errors: ["End Block must be greater than or equal to Start Block"],
        },
      ])
    } else {
      setIsBlockRangeValid(true)
      formBlocks.validateFields()
    }
  }

  const columnSearchProps = (fieldName: string) => ({
    // Configuration to filter by a search text in a table column
    // eslint-disable-next-line react/display-name
    filterDropdown: (filterEvent: Record<string, unknown>) => {
      const { setSelectedKeys, selectedKeys, confirm, clearFilters }: any =
        filterEvent

      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              searchInput.current = node
            }}
            placeholder={`Search by ${convertCamelCaseToSentence(fieldName)}`}
            value={selectedKeys[0]}
            onChange={e =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => handleSearch(selectedKeys, confirm, fieldName)}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Row justify='end'>
            <Space>
              <Button
                type='primary'
                onClick={() => handleSearch(selectedKeys, confirm, fieldName)}
                icon={<SearchOutlined />}
                size='small'
                style={{ width: 90 }}>
                Search
              </Button>
              <Button
                onClick={() => handleReset(clearFilters)}
                size='small'
                style={{ width: 90 }}>
                Reset
              </Button>
            </Space>
          </Row>
        </div>
      )
    },
    // eslint-disable-next-line react/display-name
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#E6007A" : "black" }} />
    ),
    onFilter: (value: string, record: Record<string, any>) =>
      record[fieldName]
        ? record[fieldName]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible: boolean) => {
      if (visible) {
        setTimeout(() => (searchInput.current as any).select(), 100)
      }
    },
    // eslint-disable-next-line react/display-name
    render: (text: string) =>
      searchedColumn === fieldName ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  })

  const tableColumns = [
    {
      title: "Block Number",
      dataIndex: "blockNumber",
      key: "blockNumber",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => {
        return (a.blockNumber as number) - (b.blockNumber as number)
      },
      sortDirections: ["ascend" as SortOrder, "descend" as SortOrder],
    },
    {
      title: "Event Name",
      dataIndex: "eventName",
      key: "eventName",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => {
        return (a.eventName as string).localeCompare(b.eventName as string)
      },
      sortDirections: ["ascend" as SortOrder, "descend" as SortOrder],
      ...columnSearchProps("eventName"),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) => {
        return (a.description as string).localeCompare(b.description as string)
      },
      sortDirections: ["ascend" as SortOrder, "descend" as SortOrder],
    },
    {
      title: "Event Arguments",
      dataIndex: "eventArguments",
      key: "eventArguments",
      // eslint-disable-next-line react/display-name
      render: (eventArgs: Record<number, unknown>): ReactNode => {
        const listData = []
        for (const [key, value] of Object.entries(eventArgs)) {
          listData.push(value)
        }
        return (
          <List
            size='small'
            bordered
            dataSource={listData}
            renderItem={item => {
              const [argName, argValue] = item as unknown[]
              if (
                typeof argValue === "string" ||
                typeof argValue === "number"
              ) {
                return <List.Item>{`${argName}: ${argValue}`}</List.Item>
              } else {
                const listSubArgs = []
                for (const [subKey, subValue] of Object.entries(
                  argValue as Record<string, unknown>
                )) {
                  listSubArgs.push([subKey, subValue])
                }
                return (
                  <List.Item>
                    <div className='sub-argument-name'>
                      {argName as string}:{" "}
                    </div>
                    <List
                      className='sub-argument-list'
                      size='small'
                      bordered
                      dataSource={listSubArgs}
                      renderItem={subItem => {
                        const subArgName = subItem[0]
                        let subArgValue = subItem[1]
                        if (
                          !(
                            typeof subArgValue === "string" ||
                            typeof subArgValue === "number"
                          )
                        ) {
                          subArgValue = JSON.stringify(subArgValue)
                        }
                        return (
                          <List.Item>{`${subArgName}: ${subArgValue}`}</List.Item>
                        )
                      }}
                    />
                  </List.Item>
                )
              }
            }}
          />
        )
      },
      sorter: (a: Record<string, unknown>, b: Record<string, unknown>) =>
        JSON.stringify(a.eventArguments).localeCompare(
          JSON.stringify(b.eventArguments)
        ),
      sortDirections: ["ascend" as SortOrder, "descend" as SortOrder],
    },
  ]

  return (
    <Layout className='scanner-layout'>
      <Layout.Sider
        className='scanner-sider'
        breakpoint='lg'
        width={300}
        collapsedWidth='0'
        trigger={isCollapsed ? <SearchOutlined /> : <DoubleLeftOutlined />}
        onBreakpoint={broken => {
          setIsCollapsed(broken)
        }}
        onCollapse={collapsed => {
          setIsCollapsed(collapsed)
        }}>
        <Spin spinning={isEndpointLoading} indicator={CustomSpinner}>
          <div className='params-form'>
            <Form
              layout='vertical'
              form={formEndpoint}
              initialValues={{ endpoint: "wss://rpc.polkadot.io" }}
              onFinish={handleUseEndpoint}>
              <Form.Item
                className='item-endpoint'
                name='endpoint'
                rules={[
                  { required: true, message: "Please input the endpoint URL" },
                  {
                    pattern:
                      /((?:https?|wss?):\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|(?:https?|wss?):\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
                    message: "Please input a valid endpoint URL",
                  },
                ]}
                label='Endpoint'>
                <Input
                  placeholder='Enter endpoint URL'
                  disabled={!!selectedEndpoint}
                />
              </Form.Item>
              <Row justify='end'>
                {selectedEndpoint ? (
                  <Button
                    type='default'
                    loading={loadingPercent < 100}
                    onClick={handleChangeEndpoint}>
                    Change Endpoint
                  </Button>
                ) : (
                  <Button type='primary' htmlType='submit'>
                    Use Endpoint
                  </Button>
                )}
              </Row>
            </Form>
            {selectedEndpoint && (
              <Form
                layout='vertical'
                form={formBlocks}
                onValuesChange={checkBlockRange}
                onFinish={handleStartScanning}>
                <>
                  <Form.Item
                    name='startBlock'
                    label='Start block'
                    rules={[
                      {
                        required: true,
                        message: "Please input the start block",
                      },
                    ]}>
                    <InputNumber min={1} placeholder='Enter start block' />
                  </Form.Item>
                  <Form.Item
                    name='endBlock'
                    label='End block'
                    rules={[
                      {
                        required: true,
                        message: "Please input the end block",
                      },
                    ]}>
                    <InputNumber min={1} placeholder='Enter end block' />
                  </Form.Item>
                  <Form.Item>
                    <Row justify='center'>
                      <Button
                        className='scan-btn'
                        type='primary'
                        loading={loadingPercent < 100}
                        disabled={!isBlockRangeValid}
                        htmlType='submit'>
                        Scan
                      </Button>
                    </Row>
                  </Form.Item>
                  {loadingPercent < 100 && (
                    <Form.Item>
                      <Row justify='center'>
                        <Button
                          className='scan-btn'
                          type='default'
                          loading={stopScan.current}
                          onClick={handleStopScan}>
                          Stop Scan
                        </Button>
                      </Row>
                    </Form.Item>
                  )}
                </>
              </Form>
            )}
          </div>
        </Spin>
      </Layout.Sider>
      <Layout className='scanner-inner-layout'>
        <Layout.Content className='scanner-content'>
          {eventsData ? (
            <>
              <Spin spinning={loadingPercent === 0} indicator={CustomSpinner}>
                <div className='main-content'>
                  {loadingPercent < 100 && (
                    <Progress
                      className='loading-progress-bar'
                      strokeColor={{
                        from: "#facce4",
                        to: "#e6007a",
                      }}
                      percent={loadingPercent}
                      showInfo={false}
                    />
                  )}
                  <Table
                    className='events-table'
                    columns={tableColumns as any}
                    dataSource={eventsData}
                  />
                </div>
              </Spin>
            </>
          ) : selectedEndpoint ? (
            <div className='main-content'>
              <div className='instructions'>
                Now enter your start block and end block, then click on
                &quot;Scan&quot;.
              </div>
            </div>
          ) : (
            <div className='main-content'>
              <div className='instructions'>
                To scan the events on the chain, first select an endpoint.
              </div>
            </div>
          )}
        </Layout.Content>
      </Layout>
    </Layout>
  )
}

export default Scanner
