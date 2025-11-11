import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Select, Form, Input, Button, Switch, message } from "antd";
import {
  ArrowLeftOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  ADD_BRANCH,
  LINE,
  USERS,
  EXPANSE_AUTOCOMPLETE,
} from "helpers/url_helper";
import { GET, POST, PUT } from "helpers/api_helper";
import Loader from "components/Common/Loader";
import { debounce } from "lodash";
const { Option } = Select;

const AddUser = () => {
  const [loading, setLoading] = useState(false);
  const [branchLoader, setBranchLoader] = useState(false);
  const [lineLoader, setLineLoader] = useState(false);
  const [branchList, setBranchList] = useState([]);
  const [lineList, setLineList] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialValues, setInitialValues] = useState({});
  const [expenseOptions, setExpenseOptions] = useState([]);

  const [expenseLoading, setExpenseLoading] = useState(false);

  const navigate = useNavigate();
  const  params  = useParams();
  const userId = params.id;
  const [form] = Form.useForm();

  const debouncedSearch = useCallback(
    debounce(async (searchValue) => {
      if (!searchValue) {
        setExpenseOptions([]);
        return;
      }

      setExpenseLoading(true);
      try {
        const response = await GET(
          `${EXPANSE_AUTOCOMPLETE}?value=${searchValue}`
        );
        if (response.status === 200) {
          const formattedOptions = response.data.map((item) => ({
            value: item.id,
            label: item.name,
          }));
          setExpenseOptions(formattedOptions);
        } else {
          message.error("Failed to fetch expenses");
          setExpenseOptions([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        message.error("Error fetching expenses");
        setExpenseOptions([]);
      } finally {
        setExpenseLoading(false);
      }
    }, 300),
    []
  );
  const handleExpenseChange = (selectedValues) => {
    form.setFieldsValue({ expanses: selectedValues });
  };

  // Fetch branch and line data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setBranchLoader(true);
        setLineLoader(true);
        const [branchResponse, lineResponse,expenseResponse] = await Promise.all([
          GET(ADD_BRANCH),
          GET(LINE),
          GET(EXPANSE_AUTOCOMPLETE),
        ]);

        setBranchList(
          branchResponse?.data?.map((item) => ({
            id: item?.id,
            branch_name: item?.branch_name,
          })) || []
        );

        setLineList(
          lineResponse?.data?.map((item) => ({
            id: item?.id,
            lineName: item?.lineName,
          })) || []
        );

        setExpenseOptions(
          expenseResponse.data.map((item) => ({
            value: item.id,
            label: item.name,
          }))
        );


      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load branch and line data");
        setBranchList([]);
        setLineList([]);
      } finally {
        setBranchLoader(false);
        setLineLoader(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userId) {
      console.log("User ID:", userId);
      const fetchUserData = async () => {
        try {
          setLoading(true);
          const response = await GET(`${USERS}${userId}`);
            //  const response = await GET_BRANCHES(`${ADD_BRANCH}${params.id}`);
          if (response) {
            setInitialValues(response.data);
            form.setFieldsValue(response.data);
            setIsEditMode(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          message.error("Failed to load user data");
        } finally {
          setLoading(false);
        }
      };
      fetchUserData();
    }
  },[]);

  const handleBack = useCallback(() => {
    if (form.isFieldsTouched()) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate("/user/list");
      }
    } else {
      navigate("/user/list");
    }
  }, [navigate, form]);

  // Handle form submission
  const onFinish = async (values) => {
    console.log("Form submitted with values:", values);
    setLoading(true);

    // Construct the payload with branchId and lineId
    const payload = {
      ...values,
      // branch: values.branchId,
      // line: values.lineId, // Send only the line ID
    };

    try {
      if (isEditMode) {
        const response = await PUT(`${USERS}${userId}/`, payload); // Use payload
        if (response) {
          message.success("User updated successfully");
        navigate("/user/list");
        }
      } else  {
        const response = await POST(USERS, payload); 
       
        if (response?.status === 200) {
         
          message.success("User added successfully");
          form.resetFields();
        }
        else if(response?.status === 400){
            const errorMessage = response?.data?.mobile_number || response?.data?.email||  "User not created";
            message.error(errorMessage);
        }
      }
    } catch (error) {
      console.error("Error adding/updating user:", error);
      message.error("Failed to add/update user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="page-content">
        <div className="cursor-pointer back-icon" onClick={handleBack}>
          <ArrowLeftOutlined /> Back
        </div>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <Form
                layout="vertical"
                onFinish={onFinish}
                form={form}
                initialValues={initialValues}
              >
                <div className="card p-4 shadow-sm">
                  <div className="row">
                    {/* Full Name */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Full Name"
                        name="full_name"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the full name",
                          },
                        ]}
                      >
                        <Input placeholder="Enter full name" size="large" />
                      </Form.Item>
                    </div>
                    {/* User Name */}
                    <div className="col-md-6">
                      <Form.Item
                        label="User Name"
                        name="username"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the user name",
                          },
                        ]}
                      >
                        <Input placeholder="Enter user name" size="large" />
                      </Form.Item>
                    </div>
                    {/* Password */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                          {
                            required: !isEditMode,
                            message: "Please enter the password",
                          },
                        ]}
                      >
                        <Input.Password
                          placeholder="Enter password"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    {/* Confirm Password */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        dependencies={["password"]}
                        rules={[
                          {
                            required: !isEditMode,
                            message: "Please confirm the password",
                          },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              return !value ||
                                getFieldValue("password") === value
                                ? Promise.resolve()
                                : Promise.reject(
                                    new Error("Passwords do not match!")
                                  );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          placeholder="Confirm password"
                          size="large"
                        />
                      </Form.Item>
                    </div>
                    {/* Mobile Number */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Mobile Number"
                        name="mobile_number"
                        rules={[
                          {
                            required: true,
                            message: "Please enter the mobile number",
                          },
                          {
                            pattern: /^\d{10}$/,
                            message: "Mobile number must be 10 digits!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter mobile number" size="large" />
                      </Form.Item>
                    </div>
                    {/* Email ID */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Email ID"
                        name="email"
                        rules={[
                          {
                            type: "email",
                            message: "Please enter a valid email",
                          },
                        ]}
                      >
                        <Input placeholder="Enter email ID" size="large" />
                      </Form.Item>
                    </div>
                    {/* Address */}
                    <div className="col-md-6">
                      <Form.Item label="Address" name="address">
                        <Input.TextArea
                          rows={4}
                          placeholder="Enter the address"
                          size="small"
                        />
                      </Form.Item>
                    </div>

                    {/* Pincode */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Pincode"
                        name="pin_code"
                        rules={[
                          {
                            pattern: /^\d{6}$/,
                            message: "Pincode must be 6 digits!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter the pincode" size="large" />
                      </Form.Item>
                    </div>
                    {/* Branch */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Branch"
                        name="branchId"
                        rules={[
                          { required: true, message: "Please select a branch" },
                        ]}
                      >
                        <Select
                          placeholder="Select branch"
                          showSearch
                          size="large"
                          loading={branchLoader}
                          mode="multiple"
                        >
                          {branchList?.map((branch) => (
                            <Option key={branch.id} value={branch.id}>

                              {branch.branch_name}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    {/* Line */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Line"
                        name="lineId"

                        rules={[
                          { required: true, message: "Please select a line" },
                        ]}
                      >
                        <Select
                          placeholder="Select Line"
                          showSearch
                          size="large"
                          loading={lineLoader}
                          mode="multiple"
                        >
                          {lineList.map((option) => (
                            <Option key={option.id} value={option.id}>
                              {option.lineName}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Choose Expanses Type"
                        name="expanses"
                        rules={[
                          {
                            required: true,
                            message: "Please select the expanses type",
                          },
                        ]}
                      >
                        <Select
                          mode="multiple"
                          placeholder="Search and select expenses"
                          onSearch={debouncedSearch}
                          onChange={handleExpenseChange}
                          filterOption={false}
                          loading={expenseLoading}
                          showSearch
                          allowClear
                          notFoundContent={
                            expenseLoading ? "Loading..." : "No expenses found"
                          }
                        >
                          {expenseOptions.map((option) => (
                            <Option key={option.value} value={option.value}>
                              {option.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                      <Form.Item
                        label="Role"
                        name="role"
                        rules={[
                          { required: true, message: "Please select a role" },
                        ]}
                      >
                        <Select
                          placeholder="Choose User Role"
                          showSearch
                          size="large"
                        >
                          <Option value="owner">Owner</Option>
                          <Option value="manager">Manager</Option>
                          <Option value="agent">Agent</Option>
                        </Select>
                      </Form.Item>
                    </div>
                    <div className="col-md-6">
                      <Form.Item
                        label="Allow to see old Transaction?"
                        name="allowTransaction"
                      >
                        <Switch
                          checkedChildren="yes"
                          unCheckedChildren="No"
                          defaultChecked
                        />
                      </Form.Item>
                    </div>
                  </div>

                  {/* Expenses & Investments Section */}
                  {/* <Divider orientation="center"> Investments</Divider>
                  <Form.List name="investment_details">
                    {(fields, { add, remove }) => (
                      <>
                        <div className="row">
                          <div className="col-md-3 ms-auto">
                            <Button
                              type="primary"
                              size="medium"
                              onClick={() => add()}
                              block
                              disabled={loading}
                            >
                              <FileAddOutlined />
                              Add Investments
                            </Button>
                          </div>
                          <div className="col-md-12">
                            {fields.map(
                              ({ key, name, ...restField }, index) => (
                                <div key={key} className="row mb-3">
                                  <div className="col-md-12">
                                    <Form.Item
                                      {...restField}
                                      name={[name, "investmentType"]}
                                      label="Investment Type"
                                    >
                                      <Input placeholder="Enter investment type" />
                                    </Form.Item>
                                  </div>
                                  <div className="d-flex justify-content-end">
                                    <Button
                                      danger
                                      onClick={() => remove(name)}
                                      className="mt-2  mb-3"
                                      disabled={loading}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <Divider orientation="center">
                                    Investment {index + 1}
                                  </Divider>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </Form.List>
                  <Divider orientation="center">Expenses </Divider>
                  <Form.List name="expense_details">
                    {(fields, { add, remove }) => (
                      <>
                        <div className="row">
                          <div className="col-md-3 ms-auto">
                            <Button
                              type="primary"
                              size="medium"
                              onClick={() => add()}
                              block
                              disabled={loading}
                            >
                              <FileAddOutlined />
                              Add Expenses
                            </Button>
                          </div>
                          <div className="col-md-12">
                            {fields.map(
                              ({ key, name, ...restField }, index) => (
                                <div key={key} className="row mb-3">
                                  <div className="col-md-12">
                                    <Form.Item
                                      {...restField}
                                      name={[name, "expenseType"]}
                                      label="Expense Type"
                                    >
                                      <Input placeholder="Enter expense type" />
                                    </Form.Item>
                                  </div>

                                  <div className="d-flex justify-content-end">
                                    <Button
                                      danger
                                      onClick={() => remove(name)}
                                      className="mt-2 mb-3"
                                      disabled={loading}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                  <Divider orientation="center">
                                    Expense {index + 1}
                                  </Divider>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </Form.List> */}

                  {/* Form Actions */}
                  <Form.Item className="text-center mt-3">
                    <Button type="primary" htmlType="submit" loading={loading}>
                      {isEditMode ? "Update" : "Submit"}
                    </Button>
                    <Button
                      type="default"
                      style={{ marginLeft: 8 }}
                      onClick={() => form.resetFields()}
                      icon={<ReloadOutlined />}
                      variant="solid"
                      color="danger"
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </Form.Item>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUser;
