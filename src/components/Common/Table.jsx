import React, { useContext, useState, useEffect } from "react";
import { Table, notification, Button, Input, Popconfirm } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { HolderOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const RowContext = React.createContext({});

const DraggableBodyRow = ({ index, className, style, ...restProps }) => {
  const { attributes, listeners, setNodeRef } = useSortable({
    id: restProps["data-row-key"],
  });

  return (
    <RowContext.Provider value={{ setActivatorNodeRef: setNodeRef, listeners }}>
      <tr ref={setNodeRef} {...attributes} {...listeners} {...restProps} />
    </RowContext.Provider>
  );
};

const TableList = ({
  data,
  Header,
  reOrder,
  filterOption,
  handleReOrder,
  handleDragEnd,
  loader,
  onDelete,
  name,
}) => {
  const [tableData, setTableData] = useState(data);
  const navigate = useNavigate();
  const [contextHolder] = notification.useNotification();
  
  useEffect(() => {
    setTableData(data);
  }, [data]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const DragHandle = () => {
    const { setActivatorNodeRef, listeners } = useContext(RowContext);

    return (
      <Button
        type="text"
        size="small"
        icon={<HolderOutlined />}
        style={{ cursor: "grab" }}
        ref={setActivatorNodeRef}
        {...listeners}
      />
    );
  };

  const onRowViewInit = (record) => {
    if (name === "branch") {
      navigate(`/branch/view/${record.id}`);
    } else if (name === "user") {
      navigate(`/user/view/${record.id}`);
    }
  };
  const onRowEditInit = (record) => {
    if (name === "branch") {
      navigate(`/branch/edit/${record.id}`);
    } else if (name === "user") {
      navigate(`/user/edit/${record.id}`);
    } else if(name === "area") {
      navigate(`/area/edit/${record.id}`);
    }else {
      navigate(`/line/edit/${record.id}`);
    }
  };

  const onDragEnd = ({ active, over }) => {
    if (!active || !over) return;
    if (active.id !== over.id) {
      const oldIndex = tableData.findIndex((item) => item.id === active.id);
      const newIndex = tableData.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const newList = arrayMove(tableData, oldIndex, newIndex);
      setTableData(newList);
      handleDragEnd(newList);
    }
  };

  const keys = {
    area: "areaName",
    line: "lineName",
    branch: "branch_name",
  };

  const generateColumns = () => {
    return Header.map((column) => {
      return {
        title: column.label,
        dataIndex: column.value,
        key: column.value,
        width: column.value === "move" ? 80 : "auto",
        sorter: column?.sort
          ? (a, b) => {
              if (
                typeof a[column.value] === "number" &&
                typeof b[column.value] === "number"
              ) {
                return a[column.value] - b[column.value];
              }
              return a[column.value] && b[column.value]
                ? a[column.value].localeCompare(b[column.value])
                : 0;
            }
          : false,
        filters: column?.filter ? filterOption[column?.value] : null,
        onFilter: column?.filter
          ? (value, record) => record[column?.value].startsWith(value)
          : false,
        filterSearch: column?.filterSearch,
        render: (record, rowData, index) => {
          if (column.value === "move") {
            return <DragHandle />;
          } else if (column.value === "actions") {
            return (
              <div className="actions d-flex gap-1">
                {name === "branch" || name === "user" ? (
                  <span
                    className="mdi mdi-eye cursor-pointer edit-icon text-primary"
                    onClick={() => onRowViewInit(rowData)}
                  />
                ) : null}

                <span
                  className="mdi mdi-pencil cursor-pointer edit-icon text-secondary"
                  onClick={() => onRowEditInit(rowData)}
                />
                <Popconfirm
                  title={`Delete ${name} ${rowData?.[
                    keys[name]
                  ]?.toUpperCase()}?`}
                  description={"Are you sure you want to Delete ?"}
                  icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                  onConfirm={() => onDelete(rowData)}
                  placement="topLeft"
                >
                  <span className="mdi mdi-delete cursor-pointer delete-icon" />
                </Popconfirm>
              </div>
            );
          } else if (column?.value === "index") {
            return <div>{index + 1}</div>;
          } else if (column?.value === "order") {
            return (
              <Input
                onChange={(event) => handleReOrder(event, rowData)}
                key={rowData?.id}
              />
            );
          } else {
            return <div>{record}</div>;
          }
        },
      };
    });
  };

  return (
    <div>
      {contextHolder}
      {reOrder ? (
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={tableData.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              dataSource={tableData}
              columns={generateColumns()}
              rowKey="id" // Ensure every row has a unique key
              pagination={false}
              bordered
              components={{
                body: {
                  row: DraggableBodyRow,
                },
              }}
              scroll={{ x: "100%" }}
            />
          </SortableContext>
        </DndContext>
      ) : (
        <Table
          dataSource={tableData}
          columns={generateColumns()}
          rowKey="id"
          pagination={false}
          bordered
          scroll={{ x: "100%" }}
          loading={loader}
        />
      )}
    </div>
  );
};

export default TableList;
