点击某一条记录“查看详情”进入商品详情页

- 【信息展示】轮播图 + 所有信息（Product + 关联的标签信息）
  - 【备注】
    - 轮播图
      - 获取全部图片列表的方式参考product/index文件中的handleUpdate
    - 需要充分考虑各个业务逻辑和需求，设计出美观大方的商品详情/购买页
- 【业务】
  - 分类科普信息：仅支持审核通过的
  - 收藏功能：加入“我的收藏”
  - 分享功能：生成url（也可组装成
    一个文本，像是腾讯会议一样）
  - 评价列表：展示该产品的评价内容
    - 【信息展示】用户表：用户名称+用户头像、评价内容、评价照片、评价等级
  - 和订单相关的业务可以暂且先进行留白

listProduct返回的数据形式：
{
    "total": 10,
    "rows": [
        {
            "productId": 17,
            "productName": "大苹果",
            "productCode": "P202505090012",
            "productDesc": "使得否",
            "mainImg": "https://meiye-fresh-choice.oss-cn-beijing.aliyuncs.com/fresh-choice-images/2025/05/09/681d6982d70654ee409fd22d.png",
            "specificationValue": 6.00,
            "specificationUnit": "kg",
            "priceUnit": "box",
            "price": 5.00,
            "unitPrice": 0.01,
            "stock": 7.00,
            "totalSales": 0.00,
            "productStatus": 1,
            "avgRating": 0.0,
            "reviewCount": 0,
            "storeName": ".",
            "storeId": 39,
            "categoryId": 2,
            "stockAlert": 2,
            "createBy": "customer1",
            "createTime": "2025-05-09 12:28:39",
            "updateBy": "customer1",
            "updateTime": "2025-05-09 12:28:39",
            "remark": null,
            "tags": [
                {
                    "createBy": null,
                    "createTime": "2025-05-08 15:18:18",
                    "updateBy": null,
                    "updateTime": "2025-05-08 15:18:18",
                    "remark": null,
                    "tagId": 7,
                    "tagName": "礼盒"
                }
            ]
        },
        {
            "productId": 4,
            "productName": "智利蓝莓",
            "productCode": "P202401004",
            "productDesc": "智利进口蓝莓，颗粒饱满",
            "mainImg": "https://picsum.photos/300/300?random=4",
            "specificationValue": 125.00,
            "specificationUnit": "g",
            "priceUnit": "盒",
            "price": 25.99,
            "unitPrice": 207.92,
            "stock": 50.00,
            "totalSales": 20.00,
            "productStatus": 0,
            "avgRating": 4.8,
            "reviewCount": 10,
            "storeName": "果园直采",
            "storeId": 39,
            "categoryId": 2,
            "stockAlert": 10,
            "createBy": "customer1",
            "createTime": "2025-05-07 10:33:10",
            "updateBy": "customer1",
            "updateTime": "2025-05-08 11:03:09",
            "remark": null,
            "tags": [
                {
                    "createBy": null,
                    "createTime": "2025-05-08 15:18:18",
                    "updateBy": null,
                    "updateTime": "2025-05-08 15:18:18",
                    "remark": null,
                    "tagId": 2,
                    "tagName": "进口"
                },
                {
                    "createBy": null,
                    "createTime": "2025-05-08 15:18:18",
                    "updateBy": null,
                    "updateTime": "2025-05-08 15:18:18",
                    "remark": null,
                    "tagId": 4,
                    "tagName": "有机"
                },
                {
                    "createBy": null,
                    "createTime": "2025-05-08 15:18:18",
                    "updateBy": null,
                    "updateTime": "2025-05-08 15:18:18",
                    "remark": null,
                    "tagId": 7,
                    "tagName": "礼盒"
                }
            ]
        },
        ...
    ]
}

Product实体设计：
***产品表***，最小单元的商品 （tb_product）

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

标签实体设计：
### tb_tag

- ***标签表***，为产品提供灵活的标签选择（tb_tag）
  - 主键约束 -- tag_id
  - 标签名称 -- tag_name
    - 唯一


收藏项实体设计
收藏表，记录用户的一项收藏产品

- 主键约束 -- favorite_id
- ***用户id*** -- user_id
  - 逻辑外键

- ***产品id*** -- product_id
  - 逻辑外键

评价实体设计
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