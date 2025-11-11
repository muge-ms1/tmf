import { DeleteFilled, EllipsisOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Col, Collapse, Dropdown, Menu, Popconfirm, Row } from 'antd';
import MODULE_DISPLAY_CONFIGURATIONS from "constants/display_config";
import moment from "moment";
import { useState,useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const GenericCollapse = ({ data, titleKey, contentKeys, name, onDelete, ItemComponent }) => {
	const navigate = useNavigate();
	const [visibleMenuId, setVisibleMenuId] = useState(null);

	const labelAndKeys = MODULE_DISPLAY_CONFIGURATIONS[name];
	titleKey = labelAndKeys ? labelAndKeys[titleKey]?.key : titleKey;

	const handleModel = (id) => {
		setVisibleMenuId(visibleMenuId === id ? null : id);
	};

	const renderMenuItems = (item, index) => {
		const commonMenuItems = [
			<Menu.Item
				key={`${index}-edit`}
				onClick={() => {
					const id = labelAndKeys ? item[labelAndKeys.id] : item?.id;
					console.log("Navigating to:", titleKey, id);
					navigate(`/${name}/edit/${id}`);
				}}
			>
				<div className='d-flex align-items-center gap-1'>
					<span className='mdi mdi-pencil cursor-pointer edit-icon text-secondary mb-0'></span>
					<span>Edit</span>
				</div>
			</Menu.Item>,
			<Menu.Item 
				key={`${index}-delete`}
			>
				<Popconfirm
					title={`Delete ${name.split("-").join(" ")} ${item[titleKey]?.toUpperCase()}?`}
					description={"Are you sure you want to delete?"}
					icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
					onConfirm={() => onDelete(item)}
					placement="topLeft"
					trigger="click"
					onClick={(e) => {
						e.stopPropagation();
					}}
					okText="Delete"
					cancelText="Cancel"
					okButtonProps={{ danger: true, type: 'primary' }}
					cancelButtonProps={{ type: 'default' }}
				>
					<div className='d-flex align-items-center gap-1' style={{ color: 'red' }}>
						<DeleteFilled style={{ color: 'red' }} />
						<span className="cursor-pointer" style={{ color: 'red' }}>Delete</span>
					</div>
				</Popconfirm>
			</Menu.Item>

		];

		if (titleKey === "branch_name") {
			commonMenuItems.unshift(
				<Menu.Item key={`${index}-view`} onClick={() => navigate(`/branch/view/${item?.id}`)}>
					<div className='d-flex align-items-center gap-1'>
						<span className='mdi mdi-eye cursor-pointer edit-icon text-primary mb-0'></span>
						<span>View</span>
					</div>
				</Menu.Item>
			);
		}

		return commonMenuItems;
	};

	const renderContent = (item, index) => {
		return (
			<div>
				{contentKeys.map((key, idx) => {
					let displayLabel, displayKey = key;
					if (labelAndKeys != null) {
						displayLabel = labelAndKeys[key]?.label;
						displayKey = labelAndKeys[key]?.key;
					} else {
						displayLabel =
							key === "id"
								? name === "branch"
									? "Branch No"
									: "SI. No"
								: key
										.replace(/_/g, " ")
										.replace(/\b\w/g, (char) => char.toUpperCase());
					}

					let displayValue =
						key === "id"
							? index + 1
							: key === "status"
							? item[key].charAt(0).toUpperCase() + item[key].slice(1)
							: key === "created_time" ||
								key === "modified_time" ||
								key === "investment_date" ||
								key === "expense_transaction_date"
							? moment(item[displayKey]).format("DD-MM-YYYY")
							: key === "investment_user"
							? `${"full_name" in item && item["full_name"] ? `${item["full_name"]} | ` : ""}${item[displayKey]}` 
							: item[displayKey];

					return (
						<div
							key={idx}
							style={{
								backgroundColor: idx % 2 === 0 ? 'white' : '#f0f0f0',
								borderRadius: '4px'
							}}
							className='px-4 py-3'
						>
							<Row style={{ alignItems: 'center' }}>
								<Col xs={12} md={8}>
									<strong>{displayLabel}:</strong>
								</Col>
								<Col xs={12} md={16}>
									{displayValue}
								</Col>
							</Row>
						</div>
					);
				})}
			</div>
		);
	};

	if (ItemComponent) {
		return (
			<div>
				{data.map((item, index) => (
					<ItemComponent
						key={index}
						item={item}
						index={index}
						titleKey={titleKey}
						name={name}
						onSwipeRight={(it) => {
							const id = labelAndKeys ? it[labelAndKeys.id] : it?.id;
							navigate(`/${name}/edit/${id}`);
						}}
						onSwipeLeft={(it) => onDelete(it)}
						renderContent={() => renderContent(item, index)}
					/>
				))}
			</div>
		);
	}

	return (
		<Collapse accordion>
			{data.map((item, index) => (
				<Panel key={index} header={
					<div className='d-flex gap-2'>
						<div>
							<h5>{item[titleKey]}</h5>
						</div>

						<div className="ms-auto">
							<Dropdown overlay={<Menu>{renderMenuItems(item, index)}</Menu>} trigger={["click"]}>
								<EllipsisOutlined
									style={{ fontSize: "24px", cursor: "pointer" }}
									onClick={(e) => {
										e.stopPropagation();
										handleModel(item?.id);
									}}
								/>
							</Dropdown>
						</div>
					</div>
				}>
					{renderContent(item, index)}
				</Panel>
			))}
		</Collapse>
	);
};

const SwipeablePanel = ({ item, index, titleKey, name, onEdit, onDelete, renderContent }) => {
	const [offset, setOffset] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const startX = useRef(0);
	const currentX = useRef(0);

	const handleTouchStart = (e) => {
		startX.current = e.touches[0].clientX;
		setIsDragging(true);
	};

	const handleTouchMove = (e) => {
		if (!isDragging) return;
		currentX.current = e.touches[0].clientX;
		const diff = currentX.current - startX.current;
		setOffset(diff);
	};

	const handleTouchEnd = () => {
		setIsDragging(false);
		
		if (offset > 100) {
			// Swipe right - Edit
			onEdit();
		} else if (offset < -100) {
			// Swipe left - Delete (show confirmation)
			setShowDeleteConfirm(true);
		}
		
		setOffset(0);
	};

	const handleDeleteConfirm = () => {
		setShowDeleteConfirm(false);
		onDelete();
	};

	const getBackgroundColor = () => {
		if (offset > 20) return '#1890ff';
		if (offset < -20) return '#ff4d4f';
		return '#fff';
	};

	return (
		<>
			<div style={{ 
				position: 'relative', 
				overflow: 'hidden', 
				marginBottom: '12px',
				borderRadius: '8px',
				border: '1px solid #d9d9d9'
			}}>
				<div style={{
					position: 'absolute',
					inset: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0 24px',
					background: getBackgroundColor(),
					transition: 'background 0.2s'
				}}>
					<div style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
						<span className='mdi mdi-pencil' style={{ fontSize: '20px' }}></span>
						<span>Edit</span>
					</div>
					<div style={{ color: '#fff', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
						<span>Delete</span>
						<DeleteFilled style={{ fontSize: '20px' }} />
					</div>
				</div>
				
				<div
					style={{
						position: 'relative',
						background: '#fff',
						borderRadius: '8px',
						transform: `translateX(${offset}px)`,
						transition: isDragging ? 'none' : 'transform 0.3s ease-out',
						userSelect: 'none'
					}}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
				>
					<div 
						className='px-4 py-3'
						style={{ 
							borderBottom: isExpanded ? '1px solid #d9d9d9' : 'none',
							cursor: 'pointer'
						}}
						onClick={() => setIsExpanded(!isExpanded)}
					>
						<div className='d-flex justify-content-between align-items-center'>
							<h5 style={{ margin: 0 }}>{item[titleKey]}</h5>
							<span 
								className={`mdi mdi-chevron-${isExpanded ? 'up' : 'down'}`}
								style={{ fontSize: '20px', color: '#8c8c8c' }}
							></span>
						</div>
					</div>
					
					{isExpanded && (
						<div className='px-2 py-2'>
							{renderContent()}
						</div>
					)}
				</div>
			</div>

			{showDeleteConfirm && (
				<div 
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(0, 0, 0, 0.45)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						zIndex: 1000
					}}
					onClick={() => setShowDeleteConfirm(false)}
				>
					<div 
						style={{
							backgroundColor: '#fff',
							borderRadius: '8px',
							padding: '24px',
							margin: '0 16px',
							maxWidth: '400px',
							width: '100%'
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
							<ExclamationCircleOutlined style={{ color: 'red', fontSize: '22px', marginRight: '12px' }} />
							<div>
								<h4 style={{ margin: '0 0 8px 0' }}>Delete {name.split("-").join(" ")} {item[titleKey]?.toUpperCase()}?</h4>
								<p style={{ margin: 0, color: '#8c8c8c' }}>Are you sure you want to delete?</p>
							</div>
						</div>
						<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
							<button
								style={{
									padding: '8px 16px',
									border: '1px solid #d9d9d9',
									borderRadius: '6px',
									background: '#fff',
									cursor: 'pointer'
								}}
								onClick={() => setShowDeleteConfirm(false)}
							>
								Cancel
							</button>
							<button
								style={{
									padding: '8px 16px',
									border: 'none',
									borderRadius: '6px',
									background: '#ff4d4f',
									color: '#fff',
									cursor: 'pointer',
									fontWeight: 500
								}}
								onClick={handleDeleteConfirm}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default GenericCollapse;