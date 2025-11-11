import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Flex, notification, Grid } from "antd";
import Table from "../../components/Common/Table";
import { GET, DELETE, POST } from "helpers/api_helper";
import { USERS, SEARCH, COLUMNCHANGE, SELECTEDCOLUMN } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import ColumnDropdown from "../../components/Common/ColumnDropdown";
import CommonSearch from "components/Common/Search";
import { debounce } from "lodash";
import GenericCollapse from "components/Common/Collapse";
let header = [
  {
    label: "S.No",
    value: "index",
  },
  {
    label: "Full Name",
    value: "full_name",
    sort: true,
  },
  {
    label: "Email",
    value: "email",
    sort: true,
    filter: true,
    filterSearch: true,
  },
  {
    label: "Mobile Number",
    value: "mobile_number",
    sort: true,
  },

  { label: "Address", value: "address", sort: true },
  { label: "Pin Code", value: "pin_code", sort: true },
  { label: "Branch", value: "branchId", sort: true },
  { label: "Role", value: "role", sort: true, filter: true, filterSearch: true },
  { label: "Line", value: "lineId", sort: true },
  { label: "Actions", value: "actions" },
];

const hiddenColumns = ["move", "order", "actions", "index"];

const ListUser = () => {
  const navigate = useNavigate();
  const [reOrder, setReorder] = useState(false);
  const [rowReorderred, setRowReorderred] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [order, setOrder] = useState({});
  const [tableHeader, setTableHeader] = useState(header);
  const [api, contextHolder] = notification.useNotification();
  const [tableLoader, setTableLoader] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteLoader, setDeleteLoader] = useState(false);
  const [reorderLoader, setReorderLoader] = useState(false);
  const [filterOption, setFilterOption] = useState({
    role: [
      { text: "Owner", value: "owner" },
      { text: "Manager", value: "manager" },
      { text: "Agent", value: "agent" },


    ],
  });
  const [selectedColumn, setSelectedColumn] = useState([]);

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    getSelectedColumn();
    getUserDetails();
  }, []);

  const sortData = (order) => {
    if (Object.keys(order).length > 0) {
      const reorderedData = [...tableData];
      Object.keys(order).forEach((value) => {
        const index = reorderedData.findIndex(
          (item) => item.id === parseInt(value)
        );
        if (index !== -1) {
          const [movedItem] = reorderedData.splice(index, 1);
          reorderedData.splice(order[value] - 1, 0, movedItem);
        }
      });
      return reorderedData;
    }
  };

  const SumbitReorder = async () => {
    try {
      setReorderLoader(true);
      const reorderedData =
        Object.keys(order)?.length > 0 ? sortData(order) : tableData;
      const response = await POST(`${USERS}reorder/`, reorderedData);
      if (response?.status === 200) {
        setTableData(reorderedData);
        setReorder(false);
        setRowReorderred(false);
        const filtered = header.filter(
          (item) => !["move", "order"].includes(item.value)
        );
        setTableHeader(filtered);
        setOrder({});
        api.success({
          message: "Re-Ordered",
          description: "The order has been updated successfully.",
          duration: 0,
        });
      } else {
        api.error({
          message: "Re-Ordered",
          description: "Failed to update the order",
          duration: 0,
        });
      }
      setReorderLoader(false);
    } catch (e) {
      setReorderLoader(false);
      notification.error({
        message: "Error",
        description: "Failed to update the order",
      });
    }
  };

  const getUserDetails = async () => {
    try {
      setTableLoader(true);
      const response = await GET(USERS);
      if (response?.status === 200) {
        setTableData(response.data);
        const filterCol = ["fullName", "email", "role"];
        const uniqueOptions = {};
        filterCol.forEach((col) => {
          uniqueOptions[col] = new Set();
        });
        response.data.forEach((item) => {
          filterCol.forEach((col) => {
            uniqueOptions[col].add(item[col]);
          });
        });
        filterCol.forEach((col) => {
          setFilterOption((prev) => {
            return {
              ...prev,
              [col]: Array.from(uniqueOptions[col]).map((value) => ({
                text: value,
                value: value,
              })),
            };
          });
        });
      } else {
        setTableData([]);
      }
      setTableLoader(false);
    } catch (error) {
      setTableLoader(false);
      setTableData([]);
    }
  };

  const clickReorder = () => {
    setReorder(true);
    setTableHeader((prev) => {
      return [
        { label: "Move", value: "move" },
        { label: "Order", value: "order" },
        ...prev,
      ];
    });
  };

  const handleReOrder = (event, row) => {
    event.preventDefault();
    setRowReorderred(true);
    setOrder((prev) => ({ ...prev, [row.id]: event.target.value }));
  };

  const handleDragEnd = (data) => {
    setTableData(data);
    setRowReorderred(true);
  };

  const handleCancel = () => {
    const filtered = header.filter(
      (item) => !["move", "order"].includes(item.value)
    );
    setTableHeader(filtered);
    setReorder(false);
  };

  const onDelete = async (record) => {
    console.log(" record", record);
    try {
      setDeleteLoader(true);
      const response = await DELETE(`${USERS}${record.username}/`);
      if (response?.status === 200) {
        const updatedData = tableData.filter((item) => item.id !== record.id);
        setTableData(updatedData);
        api.success({
          message: `${record?.fullName.toUpperCase()} User Deleted!`,
          description: "The user has been deleted successfully.",
          duration: 0,
        });
      } else {
        api.error({
          message: "User Delete",
          description: "The user is not deleted.",
          duration: 0,
        });
      }
      setDeleteLoader(false);
      setShowConfirm(false);
    } catch (error) {
      setDeleteLoader(false);
      setShowConfirm(false);
      api.error({
        message: "User Delete",
        description: "The user is not deleted.",
        duration: 0,
      });
    }
  };

  const debouncedSearch = debounce(async (searchedvalue) => {
    setTableLoader(true);
    try {
      const response = await GET(
        `${SEARCH}?module=user&&searchText=${searchedvalue}`
      );
      if (response?.status === 200) {
        setTableLoader(false);
        setTableData(response?.data);
      } else {
        setTableLoader(false);
        api.error({
          message: "Error",
          description: "No User Found",
        });
      }
    } catch (error) {
      setTableLoader(false);
      throw error;
    }
  }, 700);

  const handleColumnChange = async (value) => {
    try {
      const res = await POST(COLUMNCHANGE, {
        entity: "user",
        columns: value,
      });
      setSelectedColumn(value);
      if (res.status === 200) {
        getUserDetails();
      }
    } catch (error) {
      throw error;
    }
  };

  const getSelectedColumn = async () => {
    try {
      const res = await GET(SELECTEDCOLUMN);
      if (res.status === 200) {
        setSelectedColumn(res?.data?.user || []);
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="page-content">
      {tableLoader && <Loader />}
      {contextHolder}
      <Flex justify="space-between" wrap="wrap">
        <Flex gap="middle" wrap="wrap">
          <Button
            className="mb-3 d-flex align-items-center"
            type="primary"
            onClick={clickReorder}
            disabled={reOrder}
          >
            Re-Order
          </Button>
          {rowReorderred && (
            <Button
              className="mb-3 d-flex align-items-center"
              type="primary"
              onClick={SumbitReorder}
              loading={reorderLoader}
              disabled={reorderLoader}
            >
              Submit
            </Button>
          )}

          {reOrder && (
            <Button
              className="mb-3 d-flex align-items-center"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          )}
        </Flex>
        <Flex>
          <CommonSearch
            placeholder="Search by Full Name or Email"
            size="medium"
            allowClear
            onSearch={debouncedSearch}
            loading={tableLoader}
            onEmptySearch={getUserDetails}
          />
        </Flex>

        <Flex gap="middle">
          {!isMobile && (
            <ColumnDropdown
              options={header.filter(
                (list) => !hiddenColumns.includes(list?.value)
              )}
              onChange={handleColumnChange}
              name={"user_column"}
              selectedColumn={selectedColumn}
            />
          )}
          <Button
            className="mb-3 d-flex align-items-center"
            type="primary"
            onClick={() => navigate("/user/add")}
          >
            <span className="mdi mdi-plus" />
            Add User
          </Button>
        </Flex>
      </Flex>

      {isMobile && reOrder && (
        <Table
          data={tableData}
          reOrder={reOrder}
          Header={tableHeader}
          filterOption={filterOption}
          handleReOrder={handleReOrder}
          handleDragEnd={handleDragEnd}
          onDelete={onDelete}
          deleteLoader={deleteLoader}
          setShowConfirm={setShowConfirm}
          showConfirm={showConfirm}
        />
      )}

      {isMobile && !reOrder && (
        <GenericCollapse
          titleKey="email"
          data={tableData}
          contentKeys={[
            "id",
            "mobile_number",
            "email",
            "address",
            "Pin_code",
            "branchId",
            "role",
            "lineId",
          ]}
          onDelete={onDelete}
          name="user"
        />
      )}

      {!isMobile && (
        <Table
          data={tableData}
          reOrder={reOrder}
          Header={tableHeader.filter(
            (list) =>
              selectedColumn.includes(list.value) ||
              hiddenColumns.includes(list.value)
          )}
          filterOption={filterOption}
          handleReOrder={handleReOrder}
          handleDragEnd={handleDragEnd}
          onDelete={onDelete}
          deleteLoader={deleteLoader}
          setShowConfirm={setShowConfirm}
          showConfirm={showConfirm}
          name="user"
        />
      )}
    </div>
  );
};

export default ListUser;