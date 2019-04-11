import Taro, { Component, Config } from '@tarojs/taro';
import { View, Button, Picker, Text } from '@tarojs/components';
import { AtForm, AtButton, AtInput, AtRadio, AtIcon } from 'taro-ui';
import './index.scss';

const memoTypeMap = {
  birthday: '生日',
  event: '事件',
};

const options = Object.keys(memoTypeMap).map(el => ({
  label: memoTypeMap[el],
  value: el,
}));

export default class Memorial extends Component {
  state = {
    showAddMemo: false,
    memos: [],
    memo: {
      description: '',
      date: '',
      type: 'birthday',
    },
  };
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '纪念日',
  };

  componentWillMount() {}

  async componentDidMount() {
    Taro.showLoading();
    await this.getDemos();
    Taro.hideLoading();
  }

  componentWillUnmount() {}

  componentDidShow() {}

  componentDidHide() {}

  async getDemos() {
    const { result } = await Taro.cloud.callFunction({
      name: 'memorial',
      data: { method: 'list' },
    });

    this.setState({
      memos: result.data,
    });
  }

  addMemo() {
    this.setState({
      showAddMemo: true,
      memo: {
        description: '',
        date: '',
        type: 'birthday',
      },
    });
  }

  async onSubmit(e) {
    Taro.showLoading();
    const { memo } = this.state;
    try {
      if (memo._id) {
        const id = await Taro.cloud.callFunction({
          name: 'memorial',
          data: { method: 'update', body: memo },
        });
      } else {
        const id = await Taro.cloud.callFunction({
          name: 'memorial',
          data: { method: 'create', body: memo },
        });
      }

      await this.getDemos();

      Taro.hideLoading();
      Taro.showToast({
        title: '成功',
        icon: 'success',
        duration: 1000,
      });
      this.setState({
        showAddMemo: false,
      });
    } catch (e) {
      console.log(e);

      Taro.showToast({
        title: '保存失败，请重试。',
        duration: 1000,
      });
    }
  }

  onReset() {
    this.setState({
      showAddMemo: false,
    });
  }

  handleDescriptionChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        description: e,
      }),
    });
  }

  onTimeChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        date: e.detail.value,
      }),
    });
  }

  handleTypeChange(e) {
    const { memo } = this.state;
    this.setState({
      memo: Object.assign(memo, {
        type: e,
      }),
    });
  }

  deleteMemo(id) {
    Taro.showModal({
      title: '提示',
      content: '删除操作不可恢复，确认删除吗？',
      success: async res => {
        if (res.confirm) {
          Taro.showLoading();
          await Taro.cloud.callFunction({
            name: 'memorial',
            data: {
              method: 'delete',
              body: {
                id,
              },
            },
          });
          await this.getDemos();
          Taro.hideLoading();
          Taro.showToast({
            title: '成功',
            icon: 'success',
            duration: 2000,
          });
        }
      },
    });
  }

  editMemo(index) {
    const { memos } = this.state;
    this.setState({
      memo: this.state.memos[index],
      showAddMemo: true,
    });
  }

  render() {
    const { showAddMemo, memo, memos } = this.state;
    return (
      <View className="index">
        <div className="title">纪念日</div>
        {memos.length > 0 ? (
          <div className="memorial-list">
            {memos.map((el, index) => (
              <Button className="memo" key={el._id} onClick={() => this.editMemo(index)}>
                <div className="desc">
                  <span className="type">{el.type}</span>
                  {el.description}: <span className="date">{el.date}</span>
                </div>
                <div className="delete">
                  <AtIcon
                    value="trash"
                    onClick={() => this.deleteMemo(el._id)}
                    size="20"
                    color="#F00"
                  />
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <Text>您现在还没有记录哦，快去创建吧！</Text>
        )}

        <Button onClick={this.addMemo}>添加</Button>
        {showAddMemo ? (
          <AtForm onSubmit={this.onSubmit.bind(this)} onReset={this.onReset.bind(this)}>
            <AtInput
              name="description"
              title="描述"
              type="text"
              value={memo.description}
              onChange={this.handleDescriptionChange}
            />
            <View className="page-section">
              <View>
                <Picker mode="date" onChange={this.onTimeChange} value={memo.date}>
                  {memo.date ? (
                    <View className="picker">当前选择：{memo.date}</View>
                  ) : (
                    <View>请选择日期：</View>
                  )}
                </Picker>
              </View>
            </View>
            <AtRadio
              options={options}
              value={memo.type}
              onClick={this.handleTypeChange.bind(this)}
            />

            <AtButton formType="submit">提交</AtButton>
            <AtButton formType="reset">取消</AtButton>
          </AtForm>
        ) : (
          ''
        )}
      </View>
    );
  }
}
