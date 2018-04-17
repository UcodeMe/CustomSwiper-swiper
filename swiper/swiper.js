'use strict';
// 112
import request from '../../data/request.js';
var swiper = function (opt) {
  // 保存设置
  this.opt = opt
  // 当前 移动块停留索引
  this.currentDirection = 0

  // 盒子容器总偏移量
  this.boxTranslateX = 0
  // 每移动一张图会增加的偏移量
  this.singleOffsetX = -610
  // 触摸
  this._x_start = 0
  this._y_start = 0
  // 移动
  this._x_move = 0
  // 偏移量
  this._x_offset = 0
  // move 过程中真实偏移
  this._x_realOffset = 0
  // 离开
  this._x_end = 0
  this.screenWidth = 750
  this.screenHeight = 1210
  this.pixelRatio = 2
  // rpx
  this.maxTranX = this.singleOffsetX * (this.opt.imgLength - 1)
  // 容器宽度 width 100 是两边靠墙
  this.width = 100 * 2 + (this.opt.imgLength - 1) * 60 + 550 * this.opt.imgLength

  this.swiperIndex = 0
  // 计算宽转换比例
  this.computedScreenRatio(opt.systemInfo)
}
// 计算宽转换比例
swiper.prototype.computedScreenRatio = function (systemInfo) {
  this.pixelRatio = systemInfo.pixelRatio
  this.screenWidth = systemInfo.screenWidth
  this.screenHeight = systemInfo.screenHeight
  //this.singleOffsetX = -610
  // 奇怪的i5 按照算法会 多偏移2 px
  if (systemInfo.model.indexOf('iPhone 5') > -1) {
    this.singleOffsetX = -(610 * (this.screenWidth / 750) - 2).toFixed()
  }
  else {
    this.singleOffsetX = -610 * (this.screenWidth / 750)
  }
  this.maxTranX = this.singleOffsetX * (this.opt.imgLength - 1)
  // 回调绑定vm ,渲染盒子宽度
  this.opt.success && this.opt.success(this.width)
}
// bindtouchstart
swiper.prototype.keepStartX = function (e, callback) {
  this._x_start = e.touches[0].pageX
  this._y_start = e.touches[0].pageY
  callback && callback()
}
// bindtouchmove
/*
  函数说明 moveBox
  @params e  事件
  @params {function} callback 图片盒子的偏移量改变，绑定到vm 上面，视图发生变化
*/
swiper.prototype.moveBox = function (e, callback) {
  this._x_move = e.touches[0].pageX
  this._x_offset = this._x_move - this._x_start
  var lastTranX = this.computedTranX(this._x_offset)

  callback && callback(lastTranX)
}
// 根剧移动偏移量临界值计算出真实位移
swiper.prototype.computedTranX = function (offsetX) {
  // 滑向上一张
  if (offsetX > 0) {
    return offsetX + this.boxTranslateX
  }
  // 滑动下一张
  else if (offsetX < 0) {
    if (Math.abs(offsetX - this.boxTranslateX) > Math.abs(this.maxTranX - 50)) {
      return this.maxTranX
    } else {
      return offsetX + this.boxTranslateX
    }
  }
}
// bindtouchend 
swiper.prototype.ontouchEnd = function (e, callback) {

  // 记录手指离开屏幕的坐标
  this._x_end = e.changedTouches[0].pageX
  this._x_realOffset = this._x_end - this._x_start
  // 判断滑动距离超过 指定值 轮播一张图
  var canExchangeImgFromOffset = Math.abs(this._x_realOffset) >= 50 ? true : false
  // 滑动距离达到 换图的要求
  if (canExchangeImgFromOffset) {
    // 变量说明 计算总偏移
    var lastTotalTranlateX;
    //  滑向上一张
    if (this._x_offset > 0) {
      console.log('//  滑向上一张')
      // 判断是否已经在第一张图，若不是，则滑动上一张
      if (Math.abs(this.boxTranslateX) > 0) {
        // lastTotalTranlateX 递增
        // this.singleOffsetX 为负数 -- 得 +
        this.swiperIndex -= 1
        lastTotalTranlateX = this.boxTranslateX - this.singleOffsetX
      }
      else {
        // 已在第一张图 ，动画恢复原位
        this.swiperIndex = 0
        lastTotalTranlateX = 0
      }
    }
    //  滑向下一张
    else {
      console.log('//  滑向下一张')
      if (Math.abs(this.boxTranslateX) < Math.abs(this.maxTranX)) {
        // lastTotalTranlateX 递增
        this.swiperIndex += 1
        lastTotalTranlateX = this.boxTranslateX + this.singleOffsetX
      } else {
        console.log('到底图了')
        this.swiperIndex = this.opt.imgLength - 1
        lastTotalTranlateX = this.maxTranX
      }
    }
    this.boxTranslateX = lastTotalTranlateX
    /* callback 说明
      @参数1  是否执行动画
      @参数2  若参数1为true, 则盒子的tranX 应该变成 lastTotalTranlateX，动画飞到对应的图 
       小程序 执行 wx.createAnimation 
    */
    callback && callback(true, lastTotalTranlateX)
    // reset 所有 与touch 相关参数
    this.resetParams()
  }
  else {
    callback && callback(false)
    // reset 所有 与touch 相关参数
    this.resetParams()
  }
}
swiper.prototype.resetParams = function () {
  // 触摸
  this._x_start = 0
  this._y_start = 0
  // 移动
  this._x_move = 0
  // 偏移量
  this._x_offset = 0
  // move 过程中正式偏移
  this._x_realOffset = 0
  // 离开
  this._x_end = 0
}
// 实际实例
var Swiper

const conf = {
  data: {

    /*** 图片区域****/
    // swiper 容器宽度
    swiperContainWidth: 10000,
    // 手指移动时的偏移量
    swiperTranX: 0,
    // 轮播动画控制变量
    swiperAnimationData: {},
    // 跳转到的图片索引 swiperIndex
    swiperIndex: 0,
    bg: '../../images/bg.png',
    next: '../../images/next.png',
    pre: '../../images/pre.png',
    swiperImgUrls: [
      { url: '../../images/Gbg.png', title: '大家好啊大家好啊大家', integral: '200积分', GImage: '../../images/p.png', chButton: '../../images/chButton.png' },
      { url: '../../images/Gbg.png', title: '大家好啊2', integral: '200积分', GImage: '../../images/p.png', chButton: '../../images/chButton.png' },
      { url: '../../images/Gbg.png', title: '大家好啊大家好啊大家好' }, { url: '../../images/Gbg.png', title: '大家好啊大家好啊大家好' }]
  },

  onLoad() {
    this.initSwiper();

    var that = this;
    //获得accessToken
    var accessToken = wx.getStorageSync('accessToken');
    request.itemPost('prize/getPrizeList', { access_token: accessToken }, function (r) {
      //接口调用成功
      wx.setStorageSync('resData', r);
      var resData = wx.getStorageSync('resData');
      console.log(resData)
      that.setData({
        swiperImgUrls: resData,
      })
    })
  },



  // 兑换
  // getExchange: function (e) {
  //   var that = this;
  //   //获得accessToken
  //   var accessToken = wx.getStorageSync('accessToken');
  //   var prize_id = e.currentTarget.dataset.id;
  //   console.log(prize_id);

  //   request.itemPost('prize/getConvert', { access_token: accessToken, prize_id: prize_id }, function (r) {
  //     //接口调用成功
  //     wx.setStorageSync('resData', r);

  //     /*** 弹窗***/

  //     var resData = wx.getStorageSync('resData');
  //     console.log(resData);
  //     if (resData.status == 'success') {
  //       that.setData({
  //         showModal: true
  //       });
  //     } else {
  //       wx.showToast({
  //         title: '当前金币不足',
  //         // icon: 'loading',
  //         image: '../../images/x.png',
  //         duration: 1500,
  //         mask: true
  //       });
  //     }
  //   });

  //   // wx.clearStorageSync();
  // },
  /**
    * 弹窗
    */
  showDialogBtn: function (e) {
    var prize_id = e.currentTarget.dataset.id;
    wx.setStorageSync('prize_id', prize_id);
    console.log(prize_id);
    this.setData({
      showModal: true
    });
  },
  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
    wx.showToast({
      title: '兑换已取消',
      // icon: 'loading',
      image: '../../images/x.png',
      duration: 1500,
      mask: true
    });
  },

  // 地址表单提交

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    var _this = this;
    var accessToken = wx.getStorageSync('accessToken');
    // var nickname = e.detail.value.nickname;
    var phone = e.detail.value.phone;
    wx.setStorageSync("iphone", phone);
    // var address = e.detail.value.address;

    request.itemPost('prize/setAddress', { access_token: accessToken, phone: phone }, function (r) {
      // console.log("phone" + phone);
    });
    var prize_id = wx.getStorageSync('prize_id');
    var iphone = wx.getStorageSync("iphone");
    var iphoneL = iphone.length;
    if (iphone == "" || iphoneL != 11) {
      wx.showToast({
        title: '请输入正确手机号',
        image: '../../images/x.png',
        duration: 1500,
        mask: true
      });
    } else {
      request.itemPost('prize/getConvert', { access_token: accessToken, prize_id: prize_id }, function (r) {
        //接口调用成功
        wx.setStorageSync('resData', r);
        var resData = wx.getStorageSync('resData');
        console.log(resData);
        if (resData.status == 'success') {
          wx.showToast({
            title: '兑换成功',
            icon: 'success',
            // image: '../../../images/x.png',
            duration: 1500,
            mask: true
          });
          _this.setData({
            showModal: false
          });
        } else {
          wx.showToast({
            title: '当前金币不足',
            // icon: 'loading',
            image: '../../images/x.png',
            duration: 1500,
            mask: true
          });
          _this.setData({
            showModal: false
          });
        }
      });
    };
     },
  /**
      * 对话框确认按钮点击事件
      */

  // onConfirm: function () {
  //   this.hideModal();
  //   wx.showToast({
  //     title: '兑换成功',
  //     icon: 'succes',
  //     duration: 1500,
  //     mask: true
  //   });
  // },
  formReset: function (e) {
    console.log('form发生了reset事件，携带数据为：', e.detail.value)
    this.setData({
      chosen: ''
    })
  },


  onShow() {
    var that = this
    // 同步 系统信息
    var systemInfo = wx.getSystemInfoSync()
    // Swiper.computedScreenRatio(systemInfo)

    Swiper = new swiper({
      imgLength: this.data.swiperImgUrls.length,
      success: function (width) {
        that.setData({
          swiperContainWidth: width
        })
      },
      systemInfo: systemInfo
    })
  },
  initSwiper() {
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease'
    })
    this.swiperAnimation = animation
    var fastAnimation = wx.createAnimation({
      duration: 10,
      timingFunction: 'ease'
    })
    this.swiperFastAnimation = fastAnimation
  },
  newSwiperAnimation(tranX) {
    // 通过算法获取 偏移量
    // tranY 已带 rpx 单位
    var _tranX = tranX
    this.swiperAnimation.translateX(_tranX).step()
    this.setData({
      swiperAnimationData: this.swiperAnimation.export()
    })

  },
  newFastSwiperAnimation(tranX) {
    // 通过算法获取 偏移量
    // tranY 已带 rpx 单位
    var _tranX = tranX + 'px'
    this.swiperFastAnimation.translateX(_tranX).step()
    this.setData({
      swiperAnimationData: this.swiperFastAnimation.export()
    })
  },
  swiperTouchStart(e) {
    Swiper.keepStartX(e, function () { })
  },
  swiperTouchMove(e) {

    var swiper_endX, swiper_endY
    swiper_endX = e.changedTouches[0].pageX
    swiper_endY = e.changedTouches[0].pageY
    //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动 
    var touch_angel_result = this.GetSlideDirection(Swiper._x_start, Swiper._y_start, swiper_endX, swiper_endY)
    if (touch_angel_result == 1) {
      this.closeCalendar()
    } else if (touch_angel_result == 2) {
      this.openCalender()
    } else if (touch_angel_result == 3 || touch_angel_result == 4) {
      var that = this
      Swiper.moveBox(e, function (tranX) {
        that.newFastSwiperAnimation(tranX)
      })
    }
  },
  swiperTouchEnd(e) {
    var that = this
    Swiper.ontouchEnd(e, function (canExchange, tranX) {
      if (canExchange) {
        that.setData({
          swiperIndex: Swiper.swiperIndex
        })
        that.newSwiperAnimation(tranX)
      }
      else {
        that.newSwiperAnimation(Swiper.boxTranslateX)
      }
    })
  },
  //返回角度  
  GetSlideAngle(dx, dy) {
    return Math.atan2(dy, dx) * 180 / Math.PI
  },
  //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动  
  GetSlideDirection(startX, startY, endX, endY) {
    var dy = startY - endY;
    var dx = endX - startX;
    var result = 0;
    //如果滑动距离太短  
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
      return result;
    }
    var angle = this.GetSlideAngle(dx, dy);
    var littleAngle = 60
    var biggerAngle = 180 - 60 // 120
    if (angle >= -littleAngle && angle < littleAngle) {
      result = 4;
    } else if (angle >= littleAngle && angle < biggerAngle) {
      result = 1;
    } else if (angle >= -biggerAngle && angle < -littleAngle) {
      result = 2;
    }
    else if ((angle >= biggerAngle && angle <= 180) || (angle >= -180 && angle < -biggerAngle)) {
      result = 3;
    }
    return result;
  }

};

Page(conf);