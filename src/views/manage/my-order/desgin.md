### 我的订单10

- （目前的设定是只要交易就马上支付完成）

- 根据user_id查询订单列表以及对应的订单详情信息

  - 【信息展示】以订单为基本单元展示订单信息：订单编码、订单状态、订单总额、订单备注、店铺编号、店铺名称
    - 订单作为基本的展示单元，有两个扩展展示按钮
      - 一个点击后，展示订单有关的地址信息
      - 一个点击后，展示订单关联的各项详情项：展示除主键id、订单id、产品id外的信息
    - 若某订单存在父订单号parent_order_id，那么将具有同一个父订单号的订单作为一组展示
      - 简而言之，整个展示页面根据父订单号进行分组展示
        - 无父订单号的单独成组
          - 因为没有父订单号，因此与“有父订单的分组”样式稍有不同
        - 有订单号的根据getOrder方法，传递父订单号，获取父订单号的订单编码，作为分组展示标识
      - 父订单号只是一种分组标识，排除在基本的展示单元之外
  - 【端点】
    - /manage/order/list-user/{userId}  (GET)
  - 【业务】
    - 支持搜索
      - 搜索条件：订单编号（模糊匹配，前端实现）
      - 根据订单状态显示，预先设置几个按钮，比如“全部”“待发货”....
    - 分页展示

- 各个订单对应不同的操作按钮

  - 更新订单进入下一个状态

    - 待发货 -- 取消订单
    - 待收货 -- 确认收货
    - 待评价 -- 进行评价
      - 点击“进行评价”后，出现一个评价对话框
        - 填写内容、等级
        - 前端补足用户id和订单id后向后端创建评价
    - 已完成 -- 进行删除/再次购买
      - 再次购买：将该产品添加到购物车，使用api方法addCartItem

  - 【更新按钮端点】

    - /manage/order（POST）

    - 前端传递订单id和应当进入的新状态

    - 后端

      - 校验

        - 订单id合法

      - 业务逻辑

        - 确认收货：仅支持“待收货” -> "待评价"

        - 取消订单：仅支持“待发货” -> "已取消"
        - 删除订单：仅支持“已完成”或者“已取消”或者“待评价” -> "已删除"
          - 若为“待评价”，提醒并确认“即使未评价也要删除吗”才会删除
        - 评价商品：仅支持“待评价” -> "已完成"

- 需求api：order、cart-item、review

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
### tb_cart_item

- ***购物车项表***，存储用户的购物车中的每项记录（tb_cart_item）
  - 主键约束 -- cart_item_id
    - 唯一确定一条购物车记录
    - 仅依靠 用户id + 产品id 会导致“多次添加同一产品”的混淆
  - 产品名称 -- product_name
    - 冗余字段
  - 产品图片 -- product_main_url
    - 冗余存储
  - 产品数量 -- quantity
    - 支持增减，动态修改
  - 产品金额 -- product_price
    - 产品单价快照
  - 选中状态 -- is_selected
    - 持久化存储选中状态
    - 0：未选中，1：选中
  - ***产品id***     -- product_id
    - 外键约束
  - ***用户id***     -- user_id
    - 外键约束
### tb_review

- 评价表，订单完成后用户对某一产品的评价
  - 主键约束 -- review_id
  - 评价内容 -- content
  - 评价等级 -- rating
  - ~~评价图片 -- review_img~~
    - 存储在file表
  - is_anonymous
    - 0：不匿名；1：匿名
  - ***用户id***    -- user_id
    - 逻辑外键
  - ***订单id***   -- order_id
    - 逻辑外键
    - 购买后才可评价
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