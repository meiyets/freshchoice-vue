订单/加入购物车确认对话框

- 【按钮】
  - 在商品信息的适当位置存在两个按钮，“加入购物车/购买”
  - 两个按钮复用同一个对话框，只是相关的文字说明以及相关确认按钮触发的事件不同
- 【信息回显】
  - 地址信息
    - 回显在上部，默认仅显示默认地址，点击后可展开地址列表，进行地址的选择，并且有“管理/新增地址按钮”
      - 其中管理按钮，用于设置默认地址或删除地址或编辑地址(删除有确认对话框)
    - 若未查询到数据应当显示对应地说明文本，且点击后进入新增界面
    - 【回显--端点】√
      - /manage/address/list/{userId} (GET)
      - 触发：点击“加入购物车/购买”
      - 前端传递用户id，返回的理想数据中的rows应为若干条数据，其中有且一条数据的is_default为1(即应当仅存在一个默认地址)
      - 后端
        - 【校验】
          - 关联数据是否合法(仅存在一个或不存在默认地址)

        - 【处理】
          - 返回数据
    - 【管理--端点】√
      - /manage/address/default/{addressId}  (PUT)
      - 触发：地址回显区域点击“管理”按钮后，通过单选框切换“默认地址”时
      - 前端传递地址项的addressId
      - 后端
        - 【校验】
          - 地址id合法

        - 【处理】
          - 获取用户的所有地址数据，除选定id外其他默认标记置0
    - 【删除--端点】√
      - /manage/address/{addressds}  (DELETE)
      - 触发：点击某项的删除选项时
      - 前端传递地址项的id（由于复用了后端批量删除按钮，因此要作为数组的一部分传递）
      - 后端
        - 【校验】
          - id合法
        - 【处理】
          - 删除默认地址时，默认地址将无法删除
          - 删除
    - 【新增--端点】√
      - /manage/address  (POST)
      - 触发：地址回显区域点击“新增地址”按钮后，填写信息后提交表单时
      - 前端传递除两个id和默认标记以外的基本信息
      - 后端
        - 检查用户之前是否存在地址记录，若不存在则设置默认标记为1，否则为0
        - 新增数据
    - 【修改--端点】√
      - /manage/address（PUT）
      - 触发：地址回显区域点击“编辑地址”按钮后，填写信息后提交表单时
      - 前端传递除用户id和默认标记以外的基本信息
      - 后端
        - 检查id与操作者一致
        - 更新
  - 商品信息
    - 主图展示，当前价格(结合数量计算)，可选数量，以及规格等辅助购买的参考信息
    - 数据可直接使用初始化时获取到的productInfo等数据
    - 并且提供一个可以填写备注的地方（对应Order实体的orderRemark属性）
  - 底部确认按钮
    - 根据点入“加入购物车/购买”显示不同的文字按钮，根据点击不同的文字按钮触发不同的事件
    - 加入购物车
      - 新增当前用户的购物车项记录
      - 【新增--端点】√
        - /manage/cart-item（POST）
        - 前端传递除主键id和选中状态外的全部数据
        - 后端
          - 【校验】
            - 产品id存在且合法、检查用户id和当前操作者是否一致
          - 【处理】
            - 设置选中状态为0
            - 新增数据
    - 购买
      - 直接生成订单(仅绑定了单一产品)，以及一项对应的订单详情数据（根据前一个请求结束后返回的订单生成后返回的数据发出请求）
      - 【新增订单--端点】√
        - /manage/order（POST）
        - 前端传递订单总额（前端自行计算），省份、城市等与地址有关属性，订单备注，用户id，店铺id，地址簿id
          - 携带一个附加参数parent:false
        - 后端
          - 【校验】
            - 店铺id存在且合法，地址簿id存在且合法
          - 【填写】
            - 订单编码、父订单号(为空，由附加参数parent得知)、订单状态为待发货
      - 【新增订单详情--端点】√
        - /manage/order-detail（POST）
        - 前端传递除主键id以外的全部数据
        - 后端
          - 【校验】
            - 订单id、产品id合法
          - 【处理】
            - 新增
地址表实体：
### tb_address

- ***地址表***，用户个人信息存储（tb_address）

  - 主键约束 -- address_id

  - 电话         -- contact

  - 性别         -- gender

  - 收货人     -- consignee

  - 省份        -- province

  - 城市        -- city

  - 区县        -- district 

  - 详细地址 -- detail_address

  - 地图选址 -- location

    - > [!NOTE]
      >
      > 未来看

  - 默认标记  -- is_default

    - 该地址是否为默认地址
    - 0：否；1：是

  - ***用户id***     -- user_id

    - 逻辑外键，一个用户可以对应多条地址记录

购物车项表实体：
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
订单实体
### tb_order


- ***订单表***，用户购买产生订单（tb_order）
  - 主键约束 -- order_id
  - 订单编码 -- order_code
    - 用于外部显示的唯一编码
  - 父订单号 -- parent_order_code
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
订单详情实体
### tb_order_detail

- ***订单详细表***，保留订单的详细记录/提交的购物车信息快照（tb_order_detail）
  - 主键约束 -- order_detail_id
  - 产品名称 -- product_name_snapshot
  - 产品数量 -- quantity
  - 产品金额 -- product_price_snapshot
  - 订单总额 -- total_amount
  - 产品规格 -- specification_snapshot
  - *** 订单id***      -- order_id
    - 逻辑外键
  - *** 产品id***      -- product_id_snapshot
    - 逻辑外键 
    - 但这个产品可能被删除，因此依旧是一种快照


/manage/address/list/{userId} 返回数据格式参考：
    /** 总记录数 */
    private long total;

    /** 列表数据 */
    private List<?> rows;

    /** 消息状态码 */
    private int code;

    /** 消息内容 */
    private String msg;
{
    "total": 5,
    "rows": [
        {
            "createBy": "customer1",
            "createTime": "2025-05-16 15:23:24",
            "updateBy": "customer1",
            "updateTime": "2025-05-16 15:27:50",
            "remark": null,
            "addressId": 1,
            "contact": "13800138001",
            "gender": 0,
            "consignee": "张三",
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区",
            "detailAddress": "科技园路1号A栋1001",
            "location": null,
            "isDefault": 1,
            "addressType": 0,
            "userId": 102
        },
        {
            "createBy": "customer1",
            "createTime": "2025-05-16 15:23:24",
            "updateBy": "customer1",
            "updateTime": "2025-05-16 15:27:50",
            "remark": null,
            "addressId": 2,
            "contact": "13800138002",
            "gender": 0,
            "consignee": "张三",
            "province": "广东省",
            "city": "深圳市",
            "district": "福田区",
            "detailAddress": "福中三路1号中心广场B座2002",
            "location": null,
            "isDefault": 0,
            "addressType": 0,
            "userId": 102
        },
        {
            "createBy": "customer1",
            "createTime": "2025-05-16 15:23:24",
            "updateBy": "customer1",
            "updateTime": "2025-05-16 15:27:50",
            "remark": null,
            "addressId": 3,
            "contact": "13800138003",
            "gender": 0,
            "consignee": "张三",
            "province": "广东省",
            "city": "深圳市",
            "district": "罗湖区",
            "detailAddress": "东门北路1号商务中心501",
            "location": null,
            "isDefault": 0,
            "addressType": 0,
            "userId": 102
        },
        {
            "createBy": "customer1",
            "createTime": "2025-05-16 15:23:24",
            "updateBy": "customer1",
            "updateTime": "2025-05-16 15:27:50",
            "remark": null,
            "addressId": 4,
            "contact": "13900139001",
            "gender": 1,
            "consignee": "李四",
            "province": "广东省",
            "city": "广州市",
            "district": "天河区",
            "detailAddress": "天河路299号天河商务大厦1588",
            "location": null,
            "isDefault": 0,
            "addressType": 0,
            "userId": 102
        },
        {
            "createBy": "customer1",
            "createTime": "2025-05-16 15:23:24",
            "updateBy": "customer1",
            "updateTime": "2025-05-16 15:27:50",
            "remark": null,
            "addressId": 5,
            "contact": "13900139002",
            "gender": 1,
            "consignee": "李四",
            "province": "广东省",
            "city": "广州市",
            "district": "越秀区",
            "detailAddress": "建设大马路100号越秀新天地3001",
            "location": null,
            "isDefault": 0,
            "addressType": 0,
            "userId": 102
        }
    ],
    "code": 200,
    "msg": "查询成功"
}
新增订单返回数据格式参考：
{
    "msg": "操作成功",
    "code": 200,
    "data": 104
}
