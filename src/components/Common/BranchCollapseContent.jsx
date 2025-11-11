import React, { useState } from "react";
import { Descriptions, Modal, Button } from "antd";

const BranchCollapseContent = ({ branch, details }) => {

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState("");
  if (!branch || !details) {
    return (
      <div style={{ padding: "8px", textAlign: "center", color: "#888" }}>
        Loading branch details...
      </div>
    );
  }

  const agreementCerts = Array.isArray(details?.agreement_certificate)
    ? details.agreement_certificate
    : [];
  const additionalCerts = Array.isArray(details?.additional_details)
    ? details.additional_details
    : [];

  const truncateText = (text, maxLength = 13) =>
    !text
      ? "No description available"
      : text.length > maxLength
        ? `${text.slice(0, maxLength)}...`
        : text;

  // 🧩 Detect file type from URL
  const getFileTypeFromUrl = (url) => {
    if (!url) return "unknown";
    const cleanUrl = url.split("?")[0].toLowerCase();
    if (cleanUrl.endsWith(".pdf")) return "pdf";
    if (cleanUrl.match(/\.(jpg|jpeg|png|gif|webp)$/)) return "image";
    if (cleanUrl.match(/\.(xls|xlsx)$/)) return "excel";
    if (cleanUrl.match(/\.(doc|docx)$/)) return "word";
    if (cleanUrl.match(/\.(mp4|mov|avi)$/)) return "video";
    if (cleanUrl.match(/\.(mp3|wav)$/)) return "audio";
    return "unknown";
  };

  // 🧠 Choose icon dynamically based on file type
  const getFileIcon = (url) => {
    const type = getFileTypeFromUrl(url);
    switch (type) {
      case "pdf":
        return "https://cdn-icons-png.flaticon.com/512/337/337946.png";
      case "image":
        return "https://cdn-icons-png.flaticon.com/512/685/685655.png";
      case "word":
        return "https://cdn-icons-png.flaticon.com/512/732/732220.png";
      case "excel":
        return "https://cdn-icons-png.flaticon.com/512/732/732220.png";
      case "video":
        return "https://cdn-icons-png.flaticon.com/512/1165/1165674.png";
      case "audio":
        return "https://cdn-icons-png.flaticon.com/512/727/727240.png";
      default:
        return "https://cdn-icons-png.flaticon.com/512/833/833524.png"; // generic file icon
    }
  };

  const handleOpenFile = (url) => {
    setSelectedFile(url);
    const type = getFileTypeFromUrl(url);
    setFileType(type);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileType("");
  };

  const renderPreview = () => {
    if (!selectedFile) return <p>No file selected</p>;

    switch (fileType) {
      case "pdf":
        return (
          <iframe
            src={selectedFile}
            title="PDF Preview"
            width="100%"
            height="600px"
            style={{ border: "none", borderRadius: "8px" }}
          />
        );
      case "image":
        return (
          <img
            src={selectedFile}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "600px",
              objectFit: "contain",
              borderRadius: "8px",
            }}
          />
        );
      case "excel":
      case "word":
        return (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>
              📄 {fileType === "excel" ? "Excel" : "Word"} file preview not
              supported.
            </p>
            <Button type="primary">
              <a href={selectedFile} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </Button>
          </div>
        );

      default:
        return (
          <p>
            Preview not available.{" "}
            <Button type="link">
              <a href={selectedFile} target="_blank" rel="noopener noreferrer">
                Open in new tab
              </a>
            </Button>
          </p>
        );
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#fff",
        }}
      >
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2, md: 3 }}
          labelStyle={{
            fontWeight: 700,
            backgroundColor: "#e5e4e4ff",
            width: "140px",        // fixed label width
            minWidth: "100px",

          }}
          contentStyle={{
            backgroundColor: "#fff",
            width: "200px",         // fixed value width
            minWidth: "130px",
            overflow: "hidden",     // truncate long text
            textOverflow: "ellipsis" // add "..." if too long
          }}
        >

          {/* 🏢 Branch Info */}
          <Descriptions.Item label="Code:" span={1}>
            {details.branch_code}
          </Descriptions.Item>

          <Descriptions.Item label="Name:" span={1}>
            {branch.branch_name}
          </Descriptions.Item>

          <Descriptions.Item label="Address:" span={3}>
            {branch.branch_address}
          </Descriptions.Item>

          {/* 📜 Certificates */}
          {(agreementCerts.length > 0 || additionalCerts.length > 0) && (
            <>
              {agreementCerts.map((cert, index) => {
                const iconUrl = getFileIcon(cert.signed_url);
                return (
                  <Descriptions.Item
                    key={`agreement-${index}`}
                    label="Agreement:"
                    span={1} // ✅ changed from 3 → 1
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <img src={iconUrl} alt="File Icon" width={20} height={20} />
                      <span
                        onClick={() => handleOpenFile(cert.signed_url)}
                        style={{
                          color: "#1677ff",
                          cursor: "pointer",
                        }}
                        title={details.agreement_description}
                      >
                        {truncateText(details.agreement_description)}
                      </span>
                    </div>
                  </Descriptions.Item>
                );
              })}

              {additionalCerts.map((file, index) => {
                const iconUrl = getFileIcon(file.signed_url);
                return (
                  <Descriptions.Item
                    key={`additional-${index}`}
                    label={`Certificate ${index + 1}:`}
                    span={1} // ✅ changed from 3 → 1
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <img src={iconUrl} alt="File Icon" width={20} height={20} />
                      <span
                        onClick={() => handleOpenFile(file.signed_url)}
                        style={{
                          color: "#1677ff",
                          cursor: "pointer",
                        }}
                        title={file.additional_certifi_description}
                      >
                        {truncateText(file.additional_certifi_description)}
                      </span>
                    </div>
                  </Descriptions.Item>
                );
              })}
            </>
          )}
        </Descriptions>

      </div>

      {/* 📄 File Preview Modal */}
      <Modal
        title="Document Preview"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
        width={800}
        centered
      >
        {renderPreview()}
      </Modal>
    </>
  );
};

export default BranchCollapseContent;
