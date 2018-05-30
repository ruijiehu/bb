let util = require('../../utils/util.js');
let app = getApp();
let reqData = {}, commentData = { userId: 0 }, sendData = { }, cache, answerList;
function countdown(that) {
  var sendTxt = that.data.sendTxt
  if (sendTxt == 0) {
    that.setData({
      sendTxt: 0
    });
    return;
  }
  var time = setTimeout(function () {
    that.setData({
      sendTxt: sendTxt - 1
    });
    countdown(that);
  }
    , 1000)
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    answerList: [],
    sendInfo: '',
    momentId: '',
    subAnswer: {},
    sendType: 0,//回复类型，默认0 回复整条，如果为1则追加回复
    isInit: false,
    listHasMore: true,
    showLoading: true,
    sendTxt: 0,
    sendPhone: '',
    selfInfo: {},
    showBindPhone: false,
    answerCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      if (userInfo) {
        that.setData({
          userInfo: userInfo
        })
        if (typeof options.momentId != 'undefined') {
          that.setData({
            momentId: parseInt(options.momentId)
          })
          sendData.momentId = commentData.momentId = parseInt(options.momentId)
          that.init();
        }
      } else {
        that.setData({
          isInit: true
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (options) {
    if (this.data.userInfo && this.data.isInit) {
      this.init();
    }
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
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    reqData.currentPage = reqData.currentPage + 1;
    this.getAllComment();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let shareData = {
      title: this.data.info.title,
      desc: this.data.info.title,
      path: '/pages/my/momentInfo?momentId=' + this.data.momentId
    };
    return shareData;
  },
  /**
   * 初始化
   */
  init: function () {
    let that = this;
    if (that.data.momentId) {
      wx.request({
        url: app.globalData.javahost + '/user/moment/get',
        method: 'POST',
        data: { "momentId": that.data.momentId },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            res.data.data.createTime = util.getDateDiff(res.data.data.createTime);
            res.data.data.images = res.data.data.images ? res.data.data.images.split(";") : [];
            that.setData({
              info: res.data.data,
              isInit: true
            })
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }
        },

      })
      reqData = {
        "currentPage": 1,
        "pageSize": app.globalData.pageSize,
        "orderBys": [{ "field": "createTime", "orderType": "DESC" }],
        "conditons": [{ "field": "moment.momentId", "value": that.data.momentId }]
      }
      that.data.listHasMore = true;
      that.data.answerList = [];
      that.getAllComment();
      that.getSelfInfo();
    }

  },
  /**
   * 获取所有评论
   */
  getAllComment: function () {
    let that = this;
    if (that.data.listHasMore) {
      answerList = that.data.answerList;
      wx.request({
        url: app.globalData.javahost + '/user/moment/comment/page',
        method: 'POST',
        data: reqData,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            for (let i = 0; i < res.data.data.list.length; i++) {
              cache = res.data.data.list[i];
              if (cache.createTime) {
                cache.createTime = util.formatTime(new Date(cache.createTime));
              }
              answerList.push(cache);
            }

            that.setData({
              answerList: answerList,
              answerCount: res.data.data.totalCount
            })
            setTimeout(function () {
              that.setData({
                showLoading: false
              })
            }, 300)
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }
        },

      })
    }

  },
  /**
* 获取个人资料
*/
  getSelfInfo: function () {
    let that = this;
    wx.request({
      url: app.globalData.javahost + '/user/base/get/selfInfo',
      method: 'POST',
      data: null,
      header: {
        'content-type': 'application/json',
        'cookie': 'JSESSIONID=' + app.globalData.session
      },
      success: function (res) {
        if (res.data.success) {
          that.setData({
            selfInfo: res.data.data
          })

        } else {
          app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
            //更新数据
            that.setData({
              userInfo: userInfo
            })
            that.init();
          })
        }
      },

    })
  },
  /**
   * in用户
   */
  choiseUser: function () {
    wx.navigateTo({
      url: '/pages/dynamic/userList'
    })
  },
  /**
   * 评论
   */
  answerAdd: function (e) {
    let that = this;
    if (that.data.selfInfo.phone) {
      if (that.data.sendType == 1) {
        if (e.detail.value.commentInput) {
          commentData.content = e.detail.value.commentInput;
          commentData.momentCommentId = that.data.subAnswer.momentCommentId;
          wx.request({
            url: app.globalData.javahost + '/user/moment/comment/sub/add',
            method: 'POST',
            data: commentData,
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              if (res.data.success) {
                wx.showToast({
                  title: "回复成功",
                  duration: 2000,
                })
                that.setData({
                  commentInfo: '',
                  subAnswer: that.data.subAnswer,
                  sendType: 0,
                  listHasMore: true
                })
                that.data.answerList = [];
                reqData.currentPage = 1;
                that.getAllComment()
                // wx.navigateBack({
                //   delta: 1
                // })
              } else {
                app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                  //更新数据
                  this.setData({
                    userInfo: userInfo
                  })
                  this.init();
                })
              }

            }
          })
        } else {
          wx.showModal({
            content: '回复内容不能为空',
            showCancel: false,
            confirmText: "确定"
          })
        }
      } else {
        if (e.detail.value.sendInput) {          
          sendData.content = e.detail.value.sendInput;
          wx.request({
            url: app.globalData.javahost + '/user/moment/comment/add',
            method: 'POST',
            data: sendData,
            header: {
              'content-type': 'application/json',
              'cookie': 'JSESSIONID=' + app.globalData.session
            },
            success: function (res) {
              if (res.data.success) {
                wx.showToast({
                  title: "评论成功",
                  duration: 2000
                })
                that.setData({
                  sendInfo: '',
                  listHasMore: true
                })
                that.data.answerList = [];
                reqData.currentPage = 1;
                that.getAllComment()
              } else {
                app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                  //更新数据
                  this.setData({
                    userInfo: userInfo
                  })
                  this.init();
                })
              }

            }
          })
        } else {
          wx.showModal({
            content: '回复内容不能为空',
            showCancel: false,
            confirmText: "确定"
          })
        }

      }
    } else {
      that.setData({
        showBindPhone: true
      });
    }


  },

  /**
   * 回复&追加评论
   */
  startComment: function (e) {
    this.data.subAnswer = this.data.answerList[e.currentTarget.dataset.index];
    this.setData({
      sendInfo: '',
      subAnswer: this.data.subAnswer,
      sendType: 1
    })
  },
  /**
   * 取消二级回复，返回一级回复
   */
  resetComment: function () {
    this.setData({
      commentInfo: '',
      subAnswer: this.data.subAnswer,
      sendType: 0
    })
  },
  /**
   * 采纳
   */
  acceptClick: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    let nickname = e.currentTarget.dataset.nickname
    if (id) {
      wx.showModal({
        content: "确认采纳 " + nickname + " 的回答吗？",
        confirmText: "确定",
        cancelText: "取消",
        success: function (res) {
          if (res.confirm) {
            wx.request({
              url: app.globalData.javahost + '/user/question/answer/accept',
              method: 'POST',
              data: { answerId: id },
              header: {
                'content-type': 'application/json',
                'cookie': 'JSESSIONID=' + app.globalData.session
              },
              success: function (res) {
                if (res.data.success) {
                  wx.showToast({
                    title: "已采纳",
                    duration: 2000,
                  })
                  that.init()
                } else {
                  app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                    //更新数据
                    this.setData({
                      userInfo: userInfo
                    })
                    this.init();
                  })
                }

              }
            })
          } else if (res.cancel) {
          }
        }
      })

    }

  },
  /**
   * 查看大图
   */
  previewImage: function (e) {
    var current = e.target.dataset.src
    wx.previewImage({
      current: current,
      urls: this.data.info.images
    })
  },
  showUser: function (e) {
    // if (e.currentTarget.dataset.id == this.data.userInfo.userId) {
    //   wx.switchTab({
    //     url: '/pages/my/my'
    //   })
    // } else {
      wx.navigateTo({
        url: '/pages/my/userInfo?userId=' + e.currentTarget.dataset.id
      })
    // }
  },
  /**
 * 验证码获取倒计时
 */
  getCode: function (e) {
    let that = this;
    let phone = that.data.phone
    if (util.isPhoneNo(phone)) {
      wx.request({
        url: app.globalData.javahost + '/user/base/send/vercode',
        method: 'POST',
        data: {
          "phone": phone,
          "vercodeOperation": "BIND"
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "已发送",
              duration: 2000
            })
            that.setData({
              sendTxt: 60,
              sendPhone: phone
            });
            countdown(that);
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              that.setData({
                userInfo: userInfo
              })
              that.init();
            })
          }

        }
      })

    } else {
      wx.showModal({
        content: '手机号码不正确',
        showCancel: false,
        confirmText: "确定"
      })
    }

  },
  /**
   * 关闭绑定弹框
   */
  closeBind: function () {
    this.setData({
      showBindPhone: false
    });
  },
  /**
   * 绑定手机
   */
  bindPhone: function (e) {
    let that = this
    let error = '';
    let bindPhoneInfo = {
      // "nickname": e.detail.value.nickname,
      "phone": that.data.sendPhone,
      "vercode": e.detail.value.vercode
    }
    if (bindPhoneInfo.vercode) {

    } else {
      error = '请输入验证码';
    }
    // if (bindPhoneInfo.nickname) {

    // } else {
    //   error = '请输入姓名';
    // }
    if (error) {
      wx.showModal({
        content: error,
        showCancel: false,
        confirmText: "确定"
      })
    } else {
      wx.request({
        url: app.globalData.javahost + '/user/base/bind/phone',
        method: 'POST',
        data: bindPhoneInfo,
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "已绑定",
              duration: 2000
            })
            that.setData({
              showBindPhone: false,
              'selfInfo.phone': bindPhoneInfo.phone
            });

          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
              this.init();
            })
          }

        }
      })
    }

  },
  /**
   * 手机号码输入
   */
  inputPhone: function (e) {
    this.setData({
      phone: e.detail.value
    })
  },
  /**
   * 收藏
   */
  saveClick: function (e) {
    let that = this;
    if (this.data.info.favorYn) {
      wx.request({
        url: app.globalData.javahost + '/user/news/favor/set',
        method: 'POST',
        data: {
          "momentId": that.data.momentId,
          "favorYn": false
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "取消",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': false
            })
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
              this.init();
            })
          }

        }
      })
    } else {
      wx.request({
        url: app.globalData.javahost + '/user/news/favor/set',
        method: 'POST',
        data: {
          "momentId": that.data.momentId,
          "favorYn": true
        },
        header: {
          'content-type': 'application/json',
          'cookie': 'JSESSIONID=' + app.globalData.session
        },
        success: function (res) {
          if (res.data.success) {
            wx.showToast({
              title: "收藏",
              duration: 2000,
            })
            that.setData({
              'info.favorYn': true
            })
          } else {
            app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
              //更新数据
              this.setData({
                userInfo: userInfo
              })
              this.init();
            })
          }

        }
      })
    }
  },
  /**
   * 赞同
   */
  applaud: function (e) {
    let value = e.currentTarget.dataset.value;
    let that = this;
    if (typeof that.data.info.supportYn == 'undefined') {
      if (value == 'true') {
        wx.request({
          url: app.globalData.javahost + '/user/news/support/set',
          method: 'POST',
          data: {
            "momentId": that.data.momentId,
            "supportYn": true
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              wx.showToast({
                title: "有用",
                duration: 2000,
              })
              that.setData({
                'info.supportYs': that.data.info.supportYs + 1,
                'info.supportYn': true
              })
            } else {
              app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                //更新数据
                this.setData({
                  userInfo: userInfo
                })
                this.init();
              })
            }

          }
        })

      } else {
        wx.request({
          url: app.globalData.javahost + '/user/news/support/set',
          method: 'POST',
          data: {
            "momentId": that.data.momentId,
            "supportYn": false
          },
          header: {
            'content-type': 'application/json',
            'cookie': 'JSESSIONID=' + app.globalData.session
          },
          success: function (res) {
            if (res.data.success) {
              wx.showToast({
                title: "水",
                duration: 2000,
              })
              that.setData({
                'info.supportFs': that.data.info.supportFs + 1,
                'info.supportYn': false
              })
            } else {
              app.errorMsg(res.data.errorCode, res.data.errorMsg, function (userInfo) {
                //更新数据
                this.setData({
                  userInfo: userInfo
                })
                this.init();
              })
            }

          }
        })
      }
    }

  }
})