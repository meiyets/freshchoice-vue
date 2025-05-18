一些实体：
### tb_order


- ***订单表***，用户购买产生订单（tb_order）
  - 主键约束 -- order_id
  - 订单编码 -- order_code
    - 用于外部显示的唯一编码
  - 父订单号id -- parent_order_id
    - 关联同一次购物行为产生的多笔订单
    - 跨店铺订单自动生成，单店铺为空
    - 不作为实际记录存在
  - 订单状态 -- order_status
    - 0：保留字段（后期可替换成“待支付”）；
    - 1：待发货
    - 2：待收货
    - 3：待评价
    - 4：已完成
    - 5：已删除
    - 6：已取消
  - 订单总额 -- total_amount
  - 省份        -- province_snapshot
  - 城市        -- city_snapshot
  - 区县        -- district _snapshot
  - 详细地址 -- detail_address_snapshot
  - 收件人    -- receiver_snapshot
  - 收件人电话-- contact_snapshot
  - 订单备注 -- order_remark
    - 允许为空
  - *** 地址簿id***  -- address_id
    - 逻辑外键
  - ***用户id***     -- user_id
    - 逻辑外键，下单用户
  - ***店铺id***     -- store_id
    - 逻辑外键，一笔订单只能对应一个店铺
### tb_order_detail

- ***订单详细表***，保留订单的详细记录/提交的购物车信息快照（tb_order_detail）
  - 主键约束 -- order_detail_id
  - 产品名称 -- product_name_snapshot
  - 产品主图 -- product_main_url_snapshot
  - 产品数量 -- quantity
  - 产品金额 -- product_price_snapshot
  - 订单总额 -- total_amount
  - 产品规格 --price_unit_snapshot
  - *** 订单id***      -- order_id
    - 逻辑外键
  - *** 产品id***      -- product_id_snapshot
    - 逻辑外键 
    - 但这个产品可能被删除，因此依旧是一种快照
### tb_store

- ***店铺表***，以“商家”为角色隔离产品的集合（tb_store）

  - 主键约束 -- store_id

  - 店铺编号 -- store_code

    - 唯一

  - 店铺图标 -- store_logo

    - 归纳到file表
    - 冗余存储

  - 店铺名称 -- store_name

    - 唯一

  - 店铺描述 -- store_desc

    - > [!NOTE]
      >
      > 富文本待扩展

  - 运营状态 -- store_status

    - 0：待审核
      - 管理员审核信息后进入营业
      - 此时用户不应当具备“卖家”角色
    - 1：营业中
    - 2：停业中
      - 主动设置
      - 无法交易
    - 3：封禁中
      - 一般用户不可查看店铺主页、不可交易
      - 被动设置，可提交申诉进入待审核
    - 4：已注销
      - 主动注销

  - 联系电话 -- contact

  - 申请标记 -- audit_flag

    - 0：未申请
      - 每次操作员处理完，1->0，不会再出现在待审核列表
    - 1：已申请
      - 初始申请时默认为1，后续需要用户主动点击“申请”按钮，才会更新
    - 会有一个页面标识，这个标识在”待审核“”封禁中“时才考虑可用性

  - 审核备注 -- audit_comment

    - 将作为一个重要标识
    - 假如为空，那么其一定需要再次审核
    - 同时也能存储封禁理由，会有一个固定前缀

  - ***用户id***     -- user_id

    - 逻辑外键
    - 唯一，一个用户只能创建一个店铺

/manage/order/list-user/{userId}  (GET)返回数据格式
{
    "total": 1,
    "rows": [
        {
            "order": {
                "createBy": "customer1",
                "createTime": "2025-05-18 15:57:33",
                "updateBy": "customer1",
                "updateTime": "2025-05-18 15:57:33",
                "remark": null,
                "orderId": 146,
                "orderCode": "O202505180005",
                "parentOrderId": null,
                "orderStatus": 1,
                "totalAmount": 512.99,
                "orderRemark": null,
                "provinceSnapshot": "广东省",
                "citySnapshot": "广州市",
                "districtSnapshot": "天河区",
                "detailAddressSnapshot": "天河路299号天河商务大厦1588",
                "receiverSnapshot": "李四",
                "contactSnapshot": "13900139001",
                "addressId": 4,
                "userId": 102,
                "storeId": 39
            },
            "orderDetails": [
                {
                    "createBy": "customer1",
                    "createTime": "2025-05-18 15:57:33",
                    "updateBy": "customer1",
                    "updateTime": "2025-05-18 15:57:33",
                    "remark": null,
                    "orderDetailId": 232,
                    "productNameSnapshot": "红富士苹果B级",
                    "productPriceSnapshot": 12.99,
                    "priceUnitSnapshot": "12.99",
                    "quantity": 1,
                    "totalAmount": 12.99,
                    "orderId": 146,
                    "productIdSnapshot": 2,
                    "productMainUrlSnapshot": "https://picsum.photos/300/300?random=2"
                },
                {
                    "createBy": "customer1",
                    "createTime": "2025-05-18 15:57:33",
                    "updateBy": "customer1",
                    "updateTime": "2025-05-18 15:57:33",
                    "remark": null,
                    "orderDetailId": 233,
                    "productNameSnapshot": "测试产品",
                    "productPriceSnapshot": 500.00,
                    "priceUnitSnapshot": "500.00",
                    "quantity": 1,
                    "totalAmount": 500.00,
                    "orderId": 146,
                    "productIdSnapshot": 18,
                    "productMainUrlSnapshot": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/09/681dcc93d7068dbdece86175.jpg"
                }
            ],
            "store": {
                "createBy": "customer1",
                "createTime": "2025-05-18 15:57:33",
                "updateBy": "customer1",
                "updateTime": "2025-05-18 15:57:33",
                "remark": null,
                "storeId": 39,
                "storeCode": "S202505060007",
                "storeLogo": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/06/6819c9f3d7060a205bef37ad.jpg",
                "storeName": ".",
                "storeDesc": "<p>1</p>",
                "storeStatus": 2,
                "contact": "18534522120",
                "auditFlag": 0,
                "auditComment": "审核通过",
                "userId": 102
            }
        }
    ],
    "code": 200,
    "msg": "查询成功"
}