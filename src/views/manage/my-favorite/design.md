根据user_id查看favorite表，一一列举商品（网格布局）

- 【信息展示】
  - 基础信息：主图、产品名称、价格、规格
  - 店铺信息：店铺名称、店铺状态
  - 商品状态：上架状态、库存状态、评分、关联标签
  - 【端点】
    - /manage/favorite/list（GET）
- 商品跳转操作
  - 点击“查看详情”，进入详情页
  - 点击“店铺”，进入店铺页

- 支持取消收藏
  - 实际上就是删除一条收藏，传递收藏记录的id
- 支持搜索
  - 搜索条件：产品名称、店铺名称

- 支持排序
  - 排序条件：收藏时间、价格、评分
- 批量操作
  - 对于选中项批量删除
- 分页功能
- 状态提醒
  - 商品下架、库存不足、店铺异常

一些实体：
### tb_favorite

- 收藏表，记录用户的一项收藏产品

  - 主键约束 -- favorite_id
  - ***用户id*** -- user_id
    - 逻辑外键

  - ***产品id*** -- product_id
    - 逻辑外键

> - 多对多关系延伸表
> - 通过user_id查询产品列表，再通过其查询产品信息
>
> ### tb_product

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

/manage/favorite/list（GET）返回数据格式参考
{
    "total": 2,
    "rows": [
        {
            "productVO": {
                "productId": 1,
                "productName": "红富士苹果A级",
                "productCode": "P202401001",
                "productDesc": "精选红富士苹果A级，果肉细腻，口感甜脆，新鲜采摘",
                "mainImg": "https://picsum.photos/300/300?random=1",
                "specificationValue": 500.00,
                "specificationUnit": "g",
                "priceUnit": "盒",
                "price": 15.99,
                "unitPrice": 31.98,
                "stock": 100.00,
                "totalSales": 50.00,
                "productStatus": 0,
                "avgRating": 4.5,
                "reviewCount": 20,
                "storeName": "鲜果优选",
                "storeId": 1,
                "categoryId": 1,
                "stockAlert": 20,
                "createBy": "customer1",
                "createTime": "2025-05-07 10:33:10",
                "updateBy": "customer1",
                "updateTime": "2025-05-17 11:22:47",
                "remark": null,
                "tags": [
                    {
                        "createBy": null,
                        "createTime": "2025-05-08 15:18:18",
                        "updateBy": null,
                        "updateTime": "2025-05-08 15:18:18",
                        "remark": null,
                        "tagId": 1,
                        "tagName": "新鲜"
                    },
                    {
                        "createBy": null,
                        "createTime": "2025-05-08 15:18:18",
                        "updateBy": null,
                        "updateTime": "2025-05-08 15:18:18",
                        "remark": null,
                        "tagId": 5,
                        "tagName": "当季"
                    },
                    {
                        "createBy": null,
                        "createTime": "2025-05-08 15:18:18",
                        "updateBy": null,
                        "updateTime": "2025-05-08 15:18:18",
                        "remark": null,
                        "tagId": 6,
                        "tagName": "热销"
                    }
                ]
            },
            "favoriteId": 12,
            "userId": 102,
            "productId": 1,
            "searchValue": null,
            "createBy": null,
            "createTime": "2025-05-17 14:17:56",
            "updateBy": null,
            "updateTime": "2025-05-17 14:17:55",
            "remark": null
        },
        {
            "productVO": {
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
                "stockAlert": 102,
                "createBy": "customer1",
                "createTime": "2025-05-09 12:36:38",
                "updateBy": "customer1",
                "updateTime": "2025-05-17 10:06:37",
                "remark": null,
                "tags": [
                    {
                        "createBy": null,
                        "createTime": "2025-05-08 15:18:18",
                        "updateBy": null,
                        "updateTime": "2025-05-08 15:18:18",
                        "remark": null,
                        "tagId": 1,
                        "tagName": "新鲜"
                    },
                    {
                        "createBy": null,
                        "createTime": "2025-05-08 15:18:18",
                        "updateBy": null,
                        "updateTime": "2025-05-08 15:18:18",
                        "remark": null,
                        "tagId": 2,
                        "tagName": "进口"
                    }
                ]
            },
            "favoriteId": 13,
            "userId": 102,
            "productId": 18,
            "searchValue": null,
            "createBy": null,
            "createTime": "2025-05-17 15:54:15",
            "updateBy": null,
            "updateTime": "2025-05-17 15:54:15",
            "remark": null
        }
    ],
    "code": 200,
    "msg": "查询成功"
}