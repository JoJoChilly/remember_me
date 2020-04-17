import Taro, { Component } from "@tarojs/taro";
import { View, Text, Button, Image, Navigator } from "@tarojs/components";
import "./index.less";
import bg from "./images/bg.jpeg";

export default class Index extends Component {
  state = {
    user: {},
    isNewUser: false
  };
  componentWillMount() {}
  async componentDidMount() {
    Taro.showLoading();
    await this.checkIsNewUser();
    Taro.hideLoading();
  }

  componentWillUnmount() {}
  config = {
    navigationBarTitleText: "Remember Me"
  };
  async checkIsNewUser() {
    const { result } = await Taro.cloud.callFunction({
      name: "user",
      data: {
        method: "login"
      }
    });
    if (result) {
      this.setState({
        user: result
      });
    } else {
      this.setState({
        isNewUser: true
      });
    }
  }
  saveUser = async e => {
    const { userInfo } = e.detail;
    const { result } = await Taro.cloud.callFunction({
      name: "user",
      data: {
        method: "register",
        body: userInfo
      }
    });
    this.setState({
      user: result,
      isNewUser: false
    });
    Taro.hideLoading();
  };

  showLoading() {
    Taro.showLoading();
  }

  jumpTo(target) {
    Taro.redirectTo({
      url: `/pages/${target}/index`
    });
  }

  onShareAppMessage() {
    return {
      title: "这里有一个非常好用的纪念日备忘录日记本，你要不要试试？",
      imageUrl: bg,
      path: "pages/index/index"
    };
  }

  componentDidShow() {}

  componentDidHide() {}

  config = {
    navigationBarTitleText: "首页"
  };

  render() {
    const { user, isNewUser } = this.state;
    return (
      <View className="index-index page-container">
        <Image src={bg} mode="aspectFill" className="bg" />

        {isNewUser ? (
          <Button
            className="auth-btn"
            open-type="getUserInfo"
            onClick={this.showLoading}
            onGetuserinfo={this.saveUser}
          >
            授权登录
          </Button>
        ) : (
          ""
        )}
        {JSON.stringify(user) !== "{}" && !isNewUser ? (
          <View className="welcome">
            <Text className="txt">欢迎，{user.nickName}</Text>
            <Button onClick={() => this.jumpTo("memorial")}>纪念日</Button>
            <Button>猫咪大赛(敬请期待)</Button>
            <Button>账本(敬请期待)</Button>
            <Navigator
              target="miniProgram"
              open-type="navigate"
              app-id="wx8abaf00ee8c3202e"
              extra-data={{ id: "144608" }}
              version="release"
              className="tucao"
            >
              提个建议
            </Navigator>
          </View>
        ) : (
          ""
        )}
      </View>
    );
  }
}
