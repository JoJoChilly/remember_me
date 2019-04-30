import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Button, Image } from '@tarojs/components';
import './index.scss';

import bg from './images/bg.jpeg';

export default class Index extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: 'Remember Me',
  };

  state = {
    context: {},
    user: {},
    isNewUser: false,
  };

  async componentDidMount() {
    Taro.showLoading();
    await this.checkIsNewUser();
    Taro.hideLoading();
  }

  async checkIsNewUser() {
    const { result } = await Taro.cloud.callFunction({
      name: 'user',
      data: {
        method: 'login',
      },
    });
    if (result) {
      this.setState({
        user: result,
      });
    } else {
      this.setState({
        isNewUser: true,
      });
    }
  }

  saveUser = async e => {
    const { userInfo } = e.detail;
    const { result } = await Taro.cloud.callFunction({
      name: 'user',
      data: {
        method: 'register',
        body: userInfo,
      },
    });
    this.setState({
      user: result,
    });
    Taro.hideLoading();
  };

  showLoading() {
    Taro.showLoading();
  }

  jumpTo(target) {
    Taro.redirectTo({
      url: `/pages/${target}/index`,
    });
  }

  onShareAppMessage() {
    return {
      title: '这里有一个非常好用的纪念日备忘录日记本，你要不要试试？',
      imageUrl: bg,
      path: 'pages/index/index',
    };
  }

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
          ''
        )}
        {JSON.stringify(user) !== '{}' && !isNewUser ? (
          <View className="welcome">
            <Text className="txt">欢迎，{user.nickName}</Text>
            <Button onClick={() => this.jumpTo('memorial')}>纪念日</Button>
            <Button>猫咪大赛(敬请期待)</Button>
            <Button>备忘录(敬请期待)</Button>
            <Button>账本(敬请期待)</Button>
            <Button>日记(敬请期待)</Button>
          </View>
        ) : (
          ''
        )}
      </View>
    );
  }
}
