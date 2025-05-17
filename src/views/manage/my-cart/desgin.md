点击“结算”后进入订单确定界面

- 【信息展示】
  - 选中商品总览（小票样式）
    - 按照店铺分组，显示各自的总览信息（设计成传统小票的样式）、细分金额等
  - 地址信息
    - 完全参考brosw-detail中的地址信息展示
    - 下引当时的需求（请注意此处的位置应当在小票下）
      -   - 地址信息
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
  - 总价等一些最后的确认区域
- 【业务】
  - 结算校验
  - 拆分订单
    - 按照店铺自动拆分多笔订单，分别发送创建订单的请求
      - 同理，对于订单下涉及的每个产品，逐个创建每个订单详情

### 我的购物车07

- 按照用户id查询查询对应的购物车项（条状布局，参考购物网站购物车）
  - 【信息展示】主图、产品名称、产品数量、各项金额 + 总金额（前端计算）
  - 【业务】
    - 按店铺分组展示，显示店铺名称
    - 选择操作(前端记录选中状态，特定时刻向后端发送)
      - 单个商品选择、店铺商品全选、全部商品全选
      - 选择后自动计算总金额
      - 后端记录is_selected
        - 在结算、离开/刷新界面、定时发送请求
        - 这样初始选中状态由后端数据决定
      - 【更新isSelected--端点】√
        - /manage/cart-item/changeSelected/{cartItemId}(PUT)
        - 前端传递购物车项id，后端将切换isSelected的值

    - 支持数量操作
      - +1、-1
        - 每次校验库存，不能超出最大限制

      - 自动计算金额

    - 删除操作
      - 单个商品删除、批量删除、清空购物车
        - 共用delCartItemAPI方法，根据不同情况传入不同的数组

    - 点击查看详情后，进入商品详情页
    - 点击店铺后，进入店铺界面
    - 状态处理
      - 商品下架提醒、库存不足提醒、店铺状态提醒
      - 异常状态自动取消选择

    - 支持加入收藏

    - 分页功能

- 点击“结算”后进入订单确定界面
  - 【信息展示】按照店铺分组，显示各自的总览信息（类似小票）、总金额、地址信息
  - 【业务】
    - 地址选择
      - 默认选择“默认地址”
      - 支持新增地址

    - 结算校验

    - 拆分订单
      - 按照店铺自动拆分多笔订单

Product实体
### tb_product

- ***产品表***，最小单元的商品 （tb_product）

  - 主键约束 -- product_id

  - 产品名称 -- product_name

    - 比如苹果A、苹果B这样的区分

  - 产品编号 -- product_code

  - 产品图片 -- main_img

    - 归纳到file表
    - 冗余存储
      - 同时还会关联查询轮播图

  - 规格数值 -- specification_value

    - 数值

  - 规格数值单位-- specification_unit

    - g、kg、jin
    - 由工具类动态计算

  - 计价单位 -- price_unit

    - 对应规格，填盒/个/斤（散装称重）

  - 产品价格 -- price

    - 单位规格下的价格

  - 单位价格 -- unit_price

    - 动态计算，仅用于统计或排序

  - 库存数量 -- stock

    - 为0时应当自动触发产品状态改变

  - 库存预警 -- stock_alert

    - 达到时触发变化
    - 针对所有产品

  - 产品销量 -- total_sales

    - 仅用于统计或排序
    - 每次订单交易改动该字段

  - 产品状态 -- product_status

    - 记录是否上架等状态

    - 0：上架、1：下架、2：售罄

    - > [!NOTE]
      >
      > 随后扩

  - - -

  - 平均评分 -- avg_rating

    - 后台计算

  - 评价数量 -- review_count

  - 店铺名称 -- store_name

    - 冗余字段，在店铺表更新时需要同步更新

  - 产品描述 -- product_desc

    - > [!NOTE]
      >
      > 富文本待扩展

  - ***店铺id***    -- store_id

    - 逻辑外键
    - 或许旨在构造一个轻量化的网站，每一个用户都能够投放自己的产品，以店铺作为约束

  - ***分类id***  -- category_id

    - 逻辑外键
    - 创建时被选择，不为空
购物车项实体
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




/manage/cart-item/list 返回数据格式
{
    "total": 2,
    "rows": [
        {
            "product": {
                "createBy": "customer1",
                "createTime": "2025-05-09 12:36:38",
                "updateBy": "customer1",
                "updateTime": "2025-05-17 10:06:37",
                "remark": null,
                "productId": 18,
                "productName": "测试产品",
                "productCode": "P202505090013",
                "productDesc": "最棒的产品",
                "mainImg": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/09/681dcc93d7068dbdece86175.jpg",
                "specificationValue": 500.00,
                "specificationUnit": "g",
                "priceUnit": "斤",
                "price": 500.00,
                "unitPrice": 1.00,
                "stock": 100.00,
                "totalSales": 0.00,
                "productStatus": 0,
                "avgRating": 0.0,
                "reviewCount": 0,
                "storeName": ".",
                "storeId": 39,
                "categoryId": 2,
                "stockAlert": 102
            },
            "cartItemId": 1,
            "productName": "质朴的冷冻鸡肉",
            "productMainUrl": "https://small-nudge.name/",
            "quantity": 566706251,
            "productPrice": 28.09,
            "isSelected": 0,
            "productId": 18,
            "userId": 102,
            "searchValue": null,
            "createBy": null,
            "createTime": "2025-05-16 18:18:23",
            "updateBy": null,
            "updateTime": "2025-05-16 18:18:23",
            "remark": null
        },
        {
            "product": {
                "createBy": "customer1",
                "createTime": "2025-05-09 12:36:38",
                "updateBy": "customer1",
                "updateTime": "2025-05-17 10:06:37",
                "remark": null,
                "productId": 18,
                "productName": "测试产品",
                "productCode": "P202505090013",
                "productDesc": "最棒的产品",
                "mainImg": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/09/681dcc93d7068dbdece86175.jpg",
                "specificationValue": 500.00,
                "specificationUnit": "g",
                "priceUnit": "斤",
                "price": 500.00,
                "unitPrice": 1.00,
                "stock": 100.00,
                "totalSales": 0.00,
                "productStatus": 0,
                "avgRating": 0.0,
                "reviewCount": 0,
                "storeName": ".",
                "storeId": 39,
                "categoryId": 2,
                "stockAlert": 102
            },
            "cartItemId": 2,
            "productName": "测试产品",
            "productMainUrl": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/09/681dcc93d7068dbdece86175.jpg",
            "quantity": 2,
            "productPrice": 500.00,
            "isSelected": 0,
            "productId": 18,
            "userId": 102,
            "searchValue": null,
            "createBy": null,
            "createTime": "2025-05-16 21:03:53",
            "updateBy": null,
            "updateTime": "2025-05-16 21:03:53",
            "remark": null
        }
    ],
    "code": 200,
    "msg": "查询成功"
}