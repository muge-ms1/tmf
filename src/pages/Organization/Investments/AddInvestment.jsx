import { Button, Form, Input, Select, notification } from "antd";
import Loader from "components/Common/Loader";
import PAYMENT_MODES_OPTIONS from "constants/payment_modes";
import { POST, PUT } from "helpers/api_helper";
import { getDetails, getList } from "helpers/getters";
import { ADD_BRANCH, INVESTMENT, LINE, USERS } from "helpers/url_helper";
import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowLeftOutlined from "@ant-design/icons/lib/icons/ArrowLeftOutlined";
import ReloadOutlined from "@ant-design/icons/lib/icons/ReloadOutlined";
import { ToastContainer } from "react-toastify";

const AddInvestment = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState(null);
  const [branchList, setBranchList] = useState(null);
  const [lineList, setLineList] = useState(null);
  const [investment, setInvestment] = useState(null);
  const [isFormEmpty, setIsFormEmpty] = useState(!params.id);

  useEffect(() => {
    if (params.id)
			getDetails(INVESTMENT, params.id).then(res => setInvestment(res));
  }, [params.id, form]);

	useEffect(() => { getList(ADD_BRANCH).then(res => setBranchList(res)) }, []);

	useEffect(() => { getList(USERS).then(res => setUserList(res)) }, []);

	useEffect(() => { getList(LINE).then(res => setLineList(res)) }, []);

  useEffect(() => {
    if (
      userList != null &&
      branchList != null &&
      lineList != null &&
      (params.id == null || investment != null)
    ) {
      setLoading(false);
      form.setFieldsValue(investment);
    }
  }, [userList, branchList, lineList, params.id, investment, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let response;
      if (params.id) {
        response = await PUT(`${INVESTMENT}${params.id}/`, values);
      } else {
        response = await POST(INVESTMENT, values);
      }
      if (response?.status === 200 || response?.status === 201) {
        notification.success({
          message: `${values.investment_title.toUpperCase()} investment ${params.id ? "updated" : "added"}!`,
          description: `Investment details has been ${params.id ? "updated" : "added"} successfully`,
        });
        navigate("/investment");
      } else {
        notification.error({
          message: `Failed to ${params.id ? "update" : "add"} investment`,
        });
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      {loading && <Loader />}

      <div className="page-content">
        <div className="cursor-pointer back-icon">
          <span onClick={() => navigate("/investment")}>
            <ArrowLeftOutlined /> Back
          </span>
        </div>

        <div className="container-fluid p-5">
          <div className="row">
            <div className="col-md-12">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>{params.id ? "Edit Investment" : "New Investment"}</h5>
              </div>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onValuesChange={(changedValues, allValues) => {
                  const isEmpty = Object.values(allValues).every(
                    (value) =>
                      value === undefined || value === null || value === ""
                  );
                  setIsFormEmpty(isEmpty);
                }}
              >
                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Investment Title"
                      name="investment_title"
                      rules={[
                        {
                          required: true,
                          message: "Please enter an investment title",
                        },
                        {
                          pattern: /^[A-Za-z][A-Za-z0-9-_ ]*$/,
                          message:
                            "Investment title must start with an alphabet and can only contain alphanumeric characters, '-' or '_'",
                        },
                      ]}
                    >
                      <Input placeholder="Enter Investment Title" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      label="Full Name | User Name"
                      name="user"
                      rules={[
                        { required: true, message: "Please select a user" },
                      ]}
                    >
                      <Select placeholder="Select User" allowClear>
                        {userList?.map((user) => (
                          <Select.Option key={user.id} value={user.id}>
                            {user.full_name && `${user.full_name} | `}{user.username}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Branch Name"
                      name="branch"
                      rules={[
                        { required: true, message: "Please select a branch" },
                      ]}
                    >
                      <Select placeholder="Select Branch" allowClear>
                        {branchList?.map((branch) => (
                          <Select.Option key={branch.id} value={branch.id}>
                            {branch.branch_name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      label="Line Name"
                      name="line"
                      rules={[
                        { required: true, message: "Please select a line" },
                      ]}
                    >
                      <Select placeholder="Select Line" allowClear>
                        {lineList?.map((line) => {
                          if (form.getFieldValue("branch") === line?.branch) {
                            return (
                              <Select.Option key={line.id} value={line.id}>
                                {line.lineName}
                              </Select.Option>
                            );
                          }
                          return null;
                        })}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Investment Amount"
                      name="investment_amount"
                      rules={[
                        { required: true, message: "Please enter an amount" },
                        {
                          type: "number",
                          min: 1,
                          message: "Amount must be greater than 0",
                          transform: (value) => Number(value),
                        },
                      ]}
                    >
                      <Input
                        type="number"
                        placeholder="Enter Investment Amount"
                      />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item
                      label="Payment Mode"
                      name="payment_mode"
                      rules={[
                        {
                          required: true,
                          message: "Please select a payment mode",
                        },
                      ]}
                    >
                      <Select placeholder="Select Payment Mode" allowClear>
                        {PAYMENT_MODES_OPTIONS.map((mode) => (
                          <Select.Option key={mode.value} value={mode.value}>
                            {mode.label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Item
                      label="Date of Investment"
                      name="investment_date"
                      rules={[
                        { required: true, message: "Please select a date" },
                      ]}
                    >
                      <Input type="date" />
                    </Form.Item>
                  </div>
                  <div className="col-md-6">
                    <Form.Item label="Comment" name="comments">
                      <Input.TextArea placeholder="Enter Comment" />
                    </Form.Item>
                  </div>
                </div>

                <div className="d-flex justify-content-center mt-4">
                  <Button type="primary" htmlType="submit" className="me-3">
                    {params.id ? "Update" : "Submit"}
                  </Button>
                  {!isFormEmpty && (
                    <Button
                      type="default"
                      variant="solid"
                      color="danger"
                      onClick={() => {
                        form.resetFields();
                        setIsFormEmpty(true);
                      }}
                      icon={<ReloadOutlined />}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </Form>
            </div>
          </div>
        </div>
        <ToastContainer />
      </div>
    </Fragment>
  );
};

export default AddInvestment;
