### 我的地址簿

- 默认仅显示默认地址，点击后可展开地址列表，进行地址的选择，并且有“管理/新增地址按钮”

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

一些实体
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

> - “买家”业务延伸出来的实体，

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
