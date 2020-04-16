import Taro, { Component } from "@tarojs/taro";
import { View, Button, Form, Input, Picker, Text } from "@tarojs/components";
import { AtIcon } from "taro-ui";
import moment from "moment";
import bg from "./../index/images/bg.jpeg";
import "./index.less";

const memoTypeMap = {
  birthday: "生日",
  event: "事件"
};

const options = Object.keys(memoTypeMap).map(el => ({
  label: memoTypeMap[el],
  value: el
}));

export default class Memorial extends Component {
  state = {
    showAddMemo: false,
    isManaging: false,
    memos: [],
    loading: true,
    memo: {
      description: "",
      date: moment().format("YYYY-MM-DD"),
      type: "birthday"
    }
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config = {
    navigationBarTitleText: "纪念日"
  };

  componentWillMount() {
    Taro.showLoading();
  }

  async componentDidMount() {
    await this.getDemos();
    this.setState({
      loading: false
    });
    Taro.hideLoading();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  async getDemos() {
    const { result } = await Taro.cloud.callFunction({
      name: "memorial",
      data: { method: "list" }
    });

    const memos = result.data

      .map(memo => {
        const memoDay = moment(memo.date);
        const memoMonth = memoDay.month();
        const memoDate = memoDay.date();

        const today = moment().startOf("date");
        const todayYear = today.year();
        const todayMonth = today.month();
        const todayDate = today.date();

        let delta = 0;
        if (memo.type === "birthday") {
          if (
            memoMonth > todayMonth ||
            (memoMonth === todayMonth && memoDate > todayDate)
          ) {
            delta = moment(
              `${todayYear}-${memoMonth + 1}-${memoDate}`,
              "YYYY-M-D"
            ).diff(today, "days");
          } else {
            delta = moment(
              `${todayYear + 1}-${memoMonth + 1}-${memoDate}`,
              "YYYY-M-D"
            ).diff(today, "days");
          }
        } else {
          delta = today.diff(memoDay, "days");
        }

        return {
          ...memo,
          delta
        };
      })
      .sort((a, b) => a.delta - b.delta);

    this.setState({
      memos
    });
  }

  addMemo() {
    this.setState({
      showAddMemo: true,
      isManaging: false,
      memo: {
        description: "",
        date: moment().format("YYYY-MM-DD"),
        type: "birthday"
      }
    });
  }

  async onSubmit(e) {
    Taro.showLoading();
    const { memo } = this.state;
    try {
      if (!memo.description) {
        Taro.showToast({
          title: "请输入描述哦",
          icon: "none",
          duration: 1000
        });
        return;
      }

      if (memo._id) {
        const id = await Taro.cloud.callFunction({
          name: "memorial",
          data: { method: "update", body: memo }
        });
      } else {
        const id = await Taro.cloud.callFunction({
          name: "memorial",
          data: { method: "create", body: memo }
        });
      }

      await this.getDemos();

      Taro.hideLoading();
      Taro.showToast({
        title: "成功",
        icon: "success",
        duration: 1000
      });
      this.setState({
        showAddMemo: false,
        isManaging: false
      });
    } catch (e) {
      console.log(e);

      Taro.showToast({
        title: "保存失败，请重试。",
        duration: 1000
      });
    }
  }

  onReset() {
    this.setState({
      showAddMemo: false,
      memo: {
        description: "",
        date: moment().format("YYYY-MM-DD"),
        type: "birthday"
      }
    });
  }

  handleDescriptionChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        description: e.detail.value.trim()
      })
    });
  }

  onTimeChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        date: e.detail.value
      })
    });
  }

  handleTypeChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        type: e
      })
    });
  }

  deleteMemo(id) {
    Taro.showModal({
      title: "提示",
      content: "删除操作不可恢复，确认删除吗？",
      success: async res => {
        if (res.confirm) {
          Taro.showLoading();
          await Taro.cloud.callFunction({
            name: "memorial",
            data: {
              method: "delete",
              body: {
                id
              }
            }
          });
          await this.getDemos();
          Taro.hideLoading();
          Taro.showToast({
            title: "成功",
            icon: "success",
            duration: 2000
          });
        }
      }
    });
  }

  editMemo(index) {
    const { memos } = this.state;
    this.setState({
      memo: memos[index],
      showAddMemo: true,
      isManaging: false
    });
  }

  toggleShowManage() {
    const { isManaging } = this.state;
    this.setState({
      isManaging: !isManaging,
      showAddMemo: false
    });
  }

  subscribe() {
    Taro.requestSubscribeMessage({
      tmplIds: ["cP0dQcBYO7KSDKyWu1VCuFrcwz8JWYnGu22deNB1ZJQ"],
      success(res) {}
    });
  }

  onShareAppMessage() {
    return {
      title: "这里有一个非常好用的纪念日备忘录日记本，你要不要试试？",
      imageUrl: bg,
      path: "pages/index/index"
    };
  }

  render() {
    const { showAddMemo, memo, memos, isManaging, loading } = this.state;
    return (
      <View className="memorial-index page-container">
        <View className="nav">
          <Button onClick={this.addMemo}>
            <AtIcon value="add" size="20" color="#424143" />
            添加
          </Button>
          {memos.length > 0 ? (
            <Button className="manage" onClick={this.toggleShowManage}>
              <AtIcon value="settings" size="20" color="#424143" />
              {isManaging ? "取消" : "管理"}
            </Button>
          ) : (
            ""
          )}
        </View>

        {showAddMemo ? (
          <Form
            className="form"
            onSubmit={this.onSubmit.bind(this)}
            onReset={this.onReset.bind(this)}
          >
            <View className="page-section">
              <View className="title">描述</View>
              <Input
                name="description"
                type="text"
                value={memo.description}
                onInput={this.handleDescriptionChange}
                placeholder="请输入描述"
              />
            </View>
            <View className="page-section">
              <Picker
                mode="date"
                onChange={this.onTimeChange}
                value={memo.date}
              >
                <View className="picker">
                  日期<span>{memo.date}</span>
                </View>
              </Picker>
            </View>
            <View className="page-section">
              <Picker
                mode="selector"
                range={options}
                rangeKey="label"
                onChange={this.handleTypeChange.bind(this)}
                value={memo.type}
              >
                <View className="picker">
                  类别<span>{memoTypeMap[memo.type]}</span>
                </View>
              </Picker>
            </View>
            <View className="operation">
              <Button className="submit" formType="submit">
                提交
              </Button>
              <Button className="reset" formType="reset">
                取消
              </Button>
            </View>
          </Form>
        ) : (
          ""
        )}

        {memos.length > 0 ? (
          <View className="memorial-list">
            {memos.map((el, index) => (
              <View className="memo" key={el._id}>
                <View className="content">
                  <View className="type">{el.type}</View>
                  <View className="desc">{el.description}</View>
                  <View className="date">{el.date}</View>
                  {el.type === "birthday" ? (
                    <View className="delta birthday">
                      还有<span>{el.delta}</span>天
                    </View>
                  ) : (
                    <View className="delta event">
                      已经过去<span>{el.delta}</span>天
                    </View>
                  )}
                  {/* <Button onClick={() => this.subscribe(el._id)}>
                    开启订阅
                  </Button> */}
                </View>

                {isManaging ? (
                  <View className="manage-ctn">
                    <Button
                      className="delete"
                      onClick={() => this.deleteMemo(el._id)}
                    >
                      <AtIcon value="trash" size="16" color="#F00" />
                    </Button>
                    <Button
                      className="edit"
                      onClick={() => this.editMemo(index)}
                    >
                      <AtIcon value="edit" size="16" color="#F00" />
                    </Button>
                  </View>
                ) : (
                  ""
                )}
              </View>
            ))}
          </View>
        ) : (
          ""
        )}
        {memos.length === 0 && loading === false ? (
          <Text className="no-memo">您现在还没有记录哦，快去创建吧！</Text>
        ) : (
          ""
        )}
      </View>
    );
  }
}
