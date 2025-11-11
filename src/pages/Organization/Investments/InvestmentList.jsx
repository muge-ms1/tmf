import React, { useState, useEffect } from "react";
import { Button, notification, Flex } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { DELETE } from "helpers/api_helper";
import { INVESTMENT } from "helpers/url_helper";
import Loader from "components/Common/Loader";
import GenericCollapse from "components/Common/Collapse";
import { getList } from "helpers/getters";

const InvestmentList = () => {
  const [loading, setLoading] = useState(true);
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    getList(INVESTMENT).then(res => setInvestments(res)).then(() => setLoading(false));
  }, []);

  const handleDelete = async (record) => {
    try {
      const response = await DELETE(`${INVESTMENT}${record.id}/`);
      if (response.status === 204) {
        setInvestments(investments.filter((item) => item.id !== record.id));
        notification.success({
          message: `${record.investment_title.toUpperCase()} investment Deleted`,
          description: "The investment has been deleted successfully.",
        });
      } else {
        notification.error({
          message: "Failed to delete investment",
        });
      }
    } catch (error) {
      notification.error({
        message: "An error occurred while deleting investment",
      });
    }
  };

  return (
    <div className="page-content">
      {loading && <Loader />}

      <Flex justify="space-between" align="center" className="mb-3">
        <h2>Investments</h2>
        <Link to="/investment/add">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Investment
          </Button>
        </Link>
      </Flex>

      <GenericCollapse
        titleKey="investment_title"
        data={investments}
        contentKeys={[
          "investment_user",
          "investment_branch",
          "investment_line",
          "investment_amount",
          "investment_date",
          "investment_payment_mode",
          "investment_comment",
        ]}
        onDelete={handleDelete}
        name="investment"
      />
    </div>
  );
};

export default InvestmentList;