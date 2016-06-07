/*!
 @Name：layer mobile v1.8 弹层组件移动版
 @Author：贤心
 @Site：http://layer.layui.com/mobie/
 @License：LGPL
 @Modify By：chency
 */

; !function (win) {
    "use strict";

    var doc = document, query = 'querySelectorAll', claname = 'getElementsByClassName', S = function (s) {
        return doc[query](s);
    };

    //默认配置
    var config = {
        type: 0,
        shade: true,
        shadeClose: false,
        fixed: true,
        anim: true
    };

    var ready = {
        extend: function (obj) {
            var newobj = JSON.parse(JSON.stringify(config));
            for (var i in obj) {
                newobj[i] = obj[i];
            }
            return newobj;
        },
        timer: {}, end: {}
    };

    //点触事件
    ready.touch = function (elem, fn) {
        var move;
        if (!/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/.test(navigator.userAgent)) {
            return elem.addEventListener('click', function (e) {
                fn.call(this, e);
            }, false);
        }
        elem.addEventListener('touchmove', function () {
            move = true;
        }, false);
        elem.addEventListener('touchend', function (e) {
            e.preventDefault();
            move || fn.call(this, e);
            move = false;
        }, false);
    };

    var index = 0, classs = ['layermbox'], Layer = function (options) {
        var that = this;
        that.config = ready.extend(options);
        that.view();
    };
    var loadIndex, msgIndex;

    Layer.prototype.view = function () {
        var that = this, config = that.config, layerbox = doc.createElement('div');

        that.id = layerbox.id = classs[0] + index;
        layerbox.setAttribute('class', classs[0] + ' ' + classs[0] + (config.type || 0));
        layerbox.setAttribute('index', index);

        var title = (function () {
            var titype = typeof config.title === 'object';
            return config.title
            ? '<h3 style="' + (titype ? config.title[1] : '') + '">' + (titype ? config.title[0] : config.title) + '</h3><button class="layermend"></button>'
            : '';
        }());

        var button = (function () {
            var btns = (config.btn || []).length, btndom;
            if (btns === 0 || !config.btn) {
                return '';
            }

            btndom = '<span type="1">' + config.btn[0] + '</span>'
            if (btns === 2) {
                btndom = btndom + '<span type="0">' + config.btn[1] + '</span>';
            }
            return '<div class="layermbtn">' + btndom + '</div>';
        }());

        if (!config.fixed) {
            config.top = config.hasOwnProperty('top') ? config.top : 100;
            config.style = config.style || '';
            config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px';
        }

        if (config.type === 2) {
            config.content = '<div class="loading"><div class="loading_leaf loading_leaf_0"></div><div class="loading_leaf loading_leaf_1"></div><div class="loading_leaf loading_leaf_2"></div><div class="loading_leaf loading_leaf_3"></div><div class="loading_leaf loading_leaf_4"></div><div class="loading_leaf loading_leaf_5"></div><div class="loading_leaf loading_leaf_6"></div><div class="loading_leaf loading_leaf_7"></div><div class="loading_leaf loading_leaf_8"></div><div class="loading_leaf loading_leaf_9"></div><div class="loading_leaf loading_leaf_10"></div><div class="loading_leaf loading_leaf_11"></div></div>';
        }

        layerbox.innerHTML = (config.shade ? '<div ' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="laymshade"></div>' : '')
        + '<div class="layermmain" ' + (!config.fixed ? 'style="position:static;"' : '') + '>'
          + '<div class="section">'
            + '<div class="layermchild ' + (config.className ? config.className : '') + ' ' + ((!config.type && !config.shade) ? 'layermborder ' : '') + (config.anim ? 'layermanim' : '') + '" ' + (config.style ? 'style="' + config.style + '"' : '') + '>'
              + title
              + '<div class="layermcont">' + config.content + '</div>'
              + button
            + '</div>'
          + '</div>'
        + '</div>';

        //if (!config.type || config.type === 2) {
        //    var dialogs = doc[claname](classs[0] + config.type), dialen = dialogs.length;
        //    if (dialen >= 1) {
        //        layer.close(dialogs[0].getAttribute('index'))
        //    }
        //}

        document.body.appendChild(layerbox);
        var elem = that.elem = S('#' + that.id)[0];
        config.success && config.success(elem);

        that.index = index++;
        that.action(config, elem);
    };

    Layer.prototype.action = function (config, elem) {
        var that = this;

        //自动关闭
        if (config.time) {
            ready.timer[that.index] = setTimeout(function () {
                layer.close(that.index);
            }, config.time * 1000);
        }

        //关闭按钮
        if (config.title) {
            var end = elem[claname]('layermend')[0], endfn = function () {
                config.cancel && config.cancel();
                layer.close(that.index);
            };
            ready.touch(end, endfn);
        }

        //确认取消
        var btn = function () {
            var type = this.getAttribute('type');
            if (type == 0) {
                config.no && config.no();
                layer.close(that.index);
            } else {
                config.yes ? config.yes.call(that) : layer.close(that.index);
            }
        };
        if (config.btn) {
            var btns = elem[claname]('layermbtn')[0].children, btnlen = btns.length;
            for (var ii = 0; ii < btnlen; ii++) {
                ready.touch(btns[ii], btn);
            }
        }

        //点遮罩关闭
        if (config.shade && config.shadeClose) {
            var shade = elem[claname]('laymshade')[0];
            ready.touch(shade, function () {
                layer.close(that.index, config.end);
            });
        }

        config.end && (ready.end[that.index] = config.end);
    };

    Layer.prototype.close = function () {
        layer.close(this.index);
    }

    win.layer = {
        v: '1.8',
        index: index,

        //核心方法
        open: function (options) {
            var o = new Layer(options || {});
            return o.index;
        },

        close: function (index, callback) {
            var ibox = S('#' + classs[0] + index)[0];
            if (!ibox) return;
            ibox.innerHTML = '';
            doc.body.removeChild(ibox);
            clearTimeout(ready.timer[index]);
            delete ready.timer[index];
            typeof ready.end[index] === 'function' && ready.end[index]();
            delete ready.end[index];
        },

        //关闭所有layer层
        closeAll: function () {
            var boxs = doc[claname](classs[0]);
            for (var i = 0, len = boxs.length; i < len; i++) {
                layer.close((boxs[0].getAttribute('index') | 0));
            }
        },
        loading: function () {
            this.close(loadIndex);
            loadIndex = this.open({ type: 2 });
        },
        closeLoading: function () {
            this.close(loadIndex);
        },
        msg: function (msg, time, callback) {

            callback = typeof time == 'function' ? time : callback;

            msgIndex = this.open({
                content: msg,
                time: typeof time == 'number' ? time :3 ,
                shadeClose:true,
                end: typeof callback == 'function' ? callback : null
            });
        },
        alert: function (msg,callback) {
            this.open({
                btn: ['确认'],
                content: msg,
                end: typeof callback == 'function' ? callback : null
            });
        },
        confirm: function (msg, callback1, callback2) {
            this.open({
                btn: ['确认', '取消'],
                content: msg,
                yes: typeof callback1 == 'function' ? callback1 : null,
                no: typeof callback2 == 'function' ? callback2 : null
            });
        },
        dialog: function (option) {
           layer.open(option);
        },
        page: function (option) {
           option.type = 1;
           return layer.open(option)
        }
    };

    'function' == typeof define ? define(function () {
       return layer;
    }) : function () {

       var js = document.scripts, script = js[js.length - 1], jsPath = script.src;
       var path = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);

       //如果合并方式，则需要单独引入layer.css
       if (script.getAttribute('merge')) return;

       document.head.appendChild(function () {
           var link = doc.createElement('link');
           link.href = path + './layer.css';
           link.type = 'text/css';
           link.rel = 'styleSheet'
           link.id = 'layermcss';
           return link;
       }());

    }();

}(window);
