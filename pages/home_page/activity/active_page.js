// pages/home_page/activity/active_page.js
let util = require('../../../utils/util.js');
let app = getApp();
let reqData = {}, cache;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show_chance: false,
    show_tip: false,
    show_info: '',
    shdaw_info: '点击下方抽奖，查看你的红包金额',
    imgalist: [],
    activityImg: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'shdaw_info',
      success: function(res) {
        console.info(res)
        that.setData({
          shdaw_info:res.data
        })
      },
    })
    that.init();
    // that.getAll();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this;
    wx.getStorage({
      key: 'shdaw_info',
      success: function (res) {
        console.info(res)
        that.setData({
          shdaw_info: res.data
        })
      },
    })
  this.init();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.init();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  /**
   * 隐藏tip
   */
  sure_ok () {
    this.setData({
      show_tip: false
    })
  },
  init () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/get/active/open',
      method: 'POST',
      data: {
        "type": 2
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.success) {
          that.setData({
            activityImg: res.data.data.image
          })
        } else {
          that.setData({
            isOpen: res.data.success
          })
        }
      },

    })
    wx.request({
      url: app.globalData.javahost + '/user/operate/check/lottery',
      method: 'POST',
      data: '',
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.data==3){
          that.setData({
            show_chance: false
          })
        } else if (res.data.data == 1){
          that.setData({
            show_chance: false
          })
        } else if (res.data.data == 2){
          that.setData({
            show_chance: false,
            shdaw_info: '奖金已经被瓜分完'
          })
        } else if (res.data.data == 4) {
          that.setData({
            show_chance: false
            
          })
        } else (
          that.setData({
            show_chance: true
          })
        )
        // if(res.data.data){
        //   that.setData({
        //     show_chance: true
        //   })
        // } else {
        //   that.setData({
        //     show_chance: false
        //   })
        // }

      }

    })
    this.getAll()
  },
  to_attend () {
    wx.navigateTo({
      url: '/pages/home_page/activity/to_send',
      // url: '/pages/home_page/activity/detail_show?id=170',
    })
  },
  choujiang () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/operate/choujiang',
      method: 'POST',
      data: '',
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
       console.info(res)
      //  console.info(res.data.data.flag)
       if (res.data.data==undefined){
         var arr = [];
        //  arr.push(res.data.data.images)
         that.setData({
           show_info: '对不起，你来迟一步，万元奖金已经被瓜分完毕',
           shdaw_info: '对不起，万元奖金已经被瓜分完毕',
           imgalist: arr,
           show_chance: false
         })
         wx.setStorage({
           key: 'shdaw_info',
           data: '对不起，万元奖金已经被瓜分完毕'
         })
       } else {
         if (res.data.data.flag == true) {
           var arr = [];
           arr.push(res.data.data.images)
           that.setData({
             show_info: '恭喜你，获得500元现金红包，你的领奖码是' + res.data.data.randomCode,
             shdaw_info: '你获得500元红包，领奖码是' + res.data.data.randomCode + '，添加微信号：waimaobangge出示领取',
             imgalist: arr
           })
           wx.setStorage({
             key: 'shdaw_info',
             data: '你获得500元红包，领奖码是' + res.data.data.randomCode + '，添加微信号：waimaobangge出示领取'
           })
           that.init();
         } else if (res.data.data.flag == false) {
           var arr = [];
           arr.push(res.data.data.images)
           that.setData({
             show_info: '恭喜你，获得1元现金红包，你的领奖码是' + res.data.data.randomCode,
             shdaw_info: '你获得1元红包，领奖码是' + res.data.data.randomCode + '，添加微信号：waimaobangge出示领取',
             imgalist: arr
           })
           wx.setStorage({
             key: 'shdaw_info',
             data: '你获得1元红包，领奖码是' + res.data.data.randomCode + '，添加微信号：waimaobangge出示领取'
           })
           that.init();
         } else {
           //  var arr = [];
           //  arr.push(res.data.data.images)
           //  that.setData({
           //    show_info: '对不起，你来迟一步，万元奖金已经被瓜分完毕',
           //    shdaw_info: '对不起，万元奖金已经被瓜分完毕',
           //    imgalist: arr
           //  })
           //   wx.setStorage({
           //    key: 'shdaw_info',
           //    data: '对不起，万元奖金已经被瓜分完毕'
           //  })
           //  that.init();
         }
       }
      
      //  if(res.data.data){
      //    wx.showModal({
      //      title: '提示',
      //      content: '恭喜你，中奖啦！',
      //      success: function (res) {
      //        if (res.confirm) {
      //          console.log('用户点击确定')
      //          wx.navigateTo({
      //            url: '/pages/home_page/activity/exchange_list',
      //          })
      //        } else if (res.cancel) {
      //          console.log('用户点击取消')
      //        }
      //      }
      //    })
      //  } else {
      //    wx.showModal({
      //      title: '提示',
      //      content: '很遗憾，未中奖，去看看别人吧',
      //      success: function (res) {
      //        if (res.confirm) {
      //          console.log('用户点击确定')
      //          wx.navigateTo({
      //            url: '/pages/home_page/activity/exchange_list',
      //          })
      //        } else if (res.cancel) {
      //          console.log('用户点击取消')
      //        }
      //      }
      //    })
      //  }


      }

    })
    this.setData({
      show_tip: true
    })
   
  },
  /**
   * 获取交流
   */
  getAll() {
    let that = this;

    wx.request({
      url: app.globalData.javahost + '/user/question/get/active/question',
      method: 'POST',
      data: {
        "showYn": true
      },
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        console.info(res);
        if (res.data.success) {
          var array = [];
          for (let i = 0; i < res.data.data.length; i++) {
            cache = res.data.data[i];
            cache.createTime = util.getDateDiff(cache.createTime);

            cache.images = cache.images ? cache.images.split(";") : [];


            array.push(cache);
          }

          that.setData({
            ListAll: array
            // listHasMore: res.data.data.currentPage >= res.data.data.pageCount ? false : true,
            // loadingHidden: true,
            // listLoading: false,
            // isInit: true
          })
          console.info(that.data.ListAll)
        }


      }

    })
  },
  /**
   * 交流详情
   */
  to_jlDetail(e) {
    let that = this;
    console.info(e.currentTarget.dataset.id)
    // if (this.data.selfInfo.verifyYn) {
    wx.navigateTo({
      url: '/pages/circle/exchange_show/exchange_show?id=' + e.currentTarget.dataset.id
    })
  },
  to_more () {
    wx.navigateTo({
      url: '/pages/home_page/activity/exchange_list',
    })
  },
  /**
   * 预览图片
   */
  previewImage: function (e) {
    console.info(e)
    let current = e.target.dataset.src
    wx.previewImage({
      current: current, // 当前显示图片的http链接     
      urls: this.data.imgalist // 需要预览的图片http链接列表     
    })
    // wx.getImageInfo({// 获取图片信息（此处可不要）  
    //   src: 'https://www.cslpyx.com/weiH5/jrkj.jpg',
    //   success: function (res) {
    //     console.log(res.width)
    //     console.log(res.height)
    //   }
    // })

  } 
})