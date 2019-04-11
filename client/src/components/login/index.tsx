import Taro, { Component } from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';

export default class Login extends Component {
  state = {
    context: {},
    user: {},
  };

  componentWillMount() {}

  componentDidMount() {}

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  saveUser = async e => {
    const { userInfo } = e.detail;
    const { result } = await Taro.cloud.callFunction({
      name: 'register',
      data: userInfo,
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

  render() {
    const { user } = this.state;
    console.log('user', user);

    return (
      <View className="index">
        {JSON.stringify(user) === '{}' ? (
          <Button open-type="getUserInfo" onClick={this.showLoading} onGetuserinfo={this.saveUser}>
            授权登录
          </Button>
        ) : (
          <div>
            <Text>欢迎</Text>
            <Button onClick={() => this.jumpTo('memorial')}>纪念日</Button>
            <Button>猫咪大赛(敬请期待)</Button>
            <Button>备忘录(敬请期待)</Button>
            <Button>账本(敬请期待)</Button>
            <Button>日记(敬请期待)</Button>
          </div>
        )}
      </View>
    );
  }
}
