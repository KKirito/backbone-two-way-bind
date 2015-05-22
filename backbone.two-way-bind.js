/**
 * Created by redhome-xiaoqi on 15/5/19.
 */
/*BindDom --> Model.xxx BindView --> Model  BindViewCollection --> Collection */

/*a closure specially for the event convert*/
function closure(tar,f){
  return function(fir, sec, thr, forth){
    f.call(tar, fir, sec, thr, forth);
  }
}

//make the Backbone.View trigger when it was removed
Backbone.View.prototype.remove = function(){

  this.$el.remove();
  this.trigger("remove", this);
  this.stopListening();
  return this;

};

/*
 judge functions
 */

Backbone.View.isView = function(ele){
  return (ele instanceof Backbone.View);
};

Backbone.Model.isModel = function(ele){
  return (ele instanceof Backbone.Model);
};

Backbone.Collection.isCollection = function(ele){
  return (ele instanceof Backbone.Collection);
};


/*
* BindDom
* content one jquery element or a view or a view collection
* it always map to a element of a model (as element.xxx or element.xxx.xx)
*/
Backbone.BindDom = function(param){

  if(!param){
    return;
  }

  if(!param.type){
    return;
  }

  this.broadcast_list = [];

  this.data_bind = "";

  this.data_type = "";

  this.from_bind_dom = false;

  this.from_bind_dom = param.from_bind_dom;

  var params = {};

  if(param.type == "jq_dom"){
    this.jq_dom = $(param.selector);

    this.data_bind = this.jq_dom.attr("data_bind");
    this.data_type = this.jq_dom.attr("data_type");

    this.bind();
  }
  else if(param.type == "view"){
    params.view = param.view;
    params.data_bind = param.data_bind;
    params.view_broadcast_index = param.view_broadcast_index;
    params.range = param.range;
    params.scope = param.scope;

    params.broadcast_list = [];
    params.broadcast_list.push(closure(this, this.on_event));

    params.from_bind_dom = true;

    this.data_type = "view";
    this.view = new Backbone.BindView(params);
  }
  else if(param.type == "view_collection"){
    params.view = param.view;
    params.data_bind = param.data_bind;
    params.bind_views_options = param.bind_views_options;
    params.view_broadcast_index = param.view_broadcast_index;
    params.scope = param.scope;

    params.broadcast_list = [];
    params.broadcast_list.push(closure(this, this.on_event));

    this.data_type = "view_collection";
    this.view_collection = new Backbone.BindViewCollection(params);
  }
  else{
    return;
  }

  var _this = this;

  if(param.broadcast_list){
    _.each(param.broadcast_list, function(content, index){
      _this.broadcast_list.push(content);
    });
  }


};

Backbone.BindDom.isBindDom = function(selector){

  var jq = $(selector);

  return jq.attr("data_bind") && jq.attr("data_type");

};

Backbone.BindDom.elementDataBind = function(selector){

  var jq = $(selector);

  return jq.attr("data_bind");

};

Backbone.BindDom.elementDataType = function(selector){

  var jq = $(selector);

  return jq.attr("data_type");

};

Backbone.BindDom.elementViewMap = function(selector){

  var jq = $(selector);

  return jq.attr("view_map");

};

_.extend(Backbone.BindDom.prototype, {

  jq_dom : {},

  view : {},

  view_collection : {},


  /*the model element to bind on */
  data_bind : null,

  data_type : null,

  broadcast_list : null,

  from_bind_dom : null,

  get_val : function(){

    if(this["data_type"] == "input"){
      return this.jq_dom.val();
    }
    else if(this["data_type"] == "img"){
      return this.jq_dom.attr("src");
    }
    else if(this["data_type"] == "BindView"){
      return this.view;
    }
    else if(this["data_type"] == "BindViewCollection"){
      return this.view_collection;
    }
    else {
      return this.jq_dom.html();
    }

  },

  set_val : function(val){

    if(this["data_type"] == "input"){
      this.jq_dom.val(val);
    }
    else if(this["data_type"] == "img"){
      this.jq_dom.attr("src", val);
    }
    else if(this["data_type"] == "view"){
      this.view.set_val(val);
    }
    else if(this["data_type"] == "view_collection"){
      this.view_collection.set_val(val);
    }
    else{
      this.jq_dom.html(val);
    }

  },

  remove : function(){

    if(this["data_type"] == "view"){
      this.view.remove();
    }
    else if(this["data_type"] == "view_collection"){
      this.view_collection.remove();
    }
    else{
      this.jq_dom.remove();
    }

  },

  find_data_bind : function(data_bind){

    if(this["data_type"] == "view"){
      return this.view.find_data_bind(data_bind);
    }
    else if(this["data_type"] == "view_collection"){
      return this.view_collection.find_data_bind(data_bind);
    }
    else{
      if(this.data_bind == data_bind){
        return this;
      }
      else{
        return null;
      }
    }

  },

  broadcast : function(event, option){
    _.each(this.broadcast_list, function(content, index){
      if(typeof content == "function"){
        content(event, option);
      }
    });
  },

  on_change : function(){
    this.broadcast("change", {current : this});
  },

  on_remove : function(){
    this.unbind();
    this.broadcast("remove", {current : this});
    this.jq_dom = null;
  },

  on_event : function(event, option){

    var opt = {
      child : option,
      current : this
    };

    this.broadcast(event, opt);

    if(event == "remove"){
      if(!option.child){
        this.broadcast("remove", {current : this});
        this.view = null;
        this.view_collection = null;
      }
    }

  },

  bind : function(){
    this.jq_dom.on("change", closure(this, this.on_change));
    this.jq_dom.on("remove", closure(this, this.on_remove));
  },

  unbind : function(){
    this.jq_dom.off("change");
    this.jq_dom.off("remove");
  }

});
//


/*
* BindView
* wrap a Backbone.View to this BindView
* extend some attributes to map the view to model
* BindView always map to model or model element (as model or model.xxx  xxx is {..} )
*/
Backbone.BindView = function(param){

  if(!param){
    return;
  }

  if(!param.view instanceof Backbone.View) {
    return;
  }

  this.bind_doms = [];

  this.broadcast_list = [];

  this.from_bind_dom = false;

  this.from_bind_dom = param.from_bind_dom;

  this.view = param.view;

  this.data_bind = param.data_bind ? param.data_bind : "";

  this.view_broadcast_index = param.view_broadcast_index ? param.view_broadcast_index : "bind_view_event";

  var range = "body";
  if(param.range){
    range = param.range;
  }
  else{

    if(this.view["range"]){
      range = this.view["range"];
    }
    else{
      if(this.view.el){
        range = this.view.el;
      }
    }
  }

  if(param.scope){
    this.get_dom_on_view(range);
  }

  var _this = this;

  if(param.broadcast_list){
    _.each(param.broadcast_list, function(content, index){
      _this.broadcast_list.push(content);
    });
  }

  this.bind();
};

Backbone.BindView.isBindView = function(ele){
  return (ele instanceof Backbone.BindView);
};

Backbone.BindView.ele_view_map = {
};

_.extend(Backbone.BindView.prototype, {

  view : {},

  data_bind : null,

  data_type : "BindView",

  bind_doms : null,

  view_broadcast_index : null,

  broadcast_list : null,

  from_bind_dom : null, //is this created by a bind dom

  get_val : function(){

    return this.bind_doms;

  },

  set_val : function(model){

    var next_model = model;

    _.each(this.bind_doms, function(content, index){

      if(content.from_bind_dom){
        next_model = model[content.data_bind];
      }
      else{
        next_model = model.get(content.data_bind);
      }

      content.set_val(next_model);

    });

  },

  remove : function(){

    this.view.remove();

  },

  find_data_bind : function(data_bind){

    if(this.data_bind == data_bind){
      return this;
    }

    var result = null;

    _.each(this.bind_doms, function(content, index){

      result = content.find_data_bind(data_bind);

    });

    return result;

  },

  find_data_bind_in_bind_doms : function(data_bind){

    var index = -1;

    _.each(this.bind_doms, function(content, ind){

      if(content.data_bind == data_bind){
        index = ind;
      }

    });

    return index;

  },

  broadcast : function(event, option){

    if(typeof this.view[this.view_broadcast_index] == "function"){
      this.view[this.view_broadcast_index](event, option);
    }

    _.each(this.broadcast_list, function(content, index){
      if(typeof content == "function"){
        content(event, option);
      }
    });

  },

  dom_event : function(event, option){

    var opt = {
      child : option,
      current : this
    };

    this.broadcast(event, opt);

    if(event == "remove"){
      if(!option.child){
        var index = this.find_data_bind_in_bind_doms(option.current.data_bind);
        this.bind_doms.splice(index, 1);
      }
    }

  },

  on_remove : function(event, view){
    this.unbind();
    this.broadcast("remove", {current : this});
    this.view = null;
  },

  bind : function(){

    this.view.on("remove", this.on_remove, this);

  },

  unbind : function(){

    this.view.off("remove");

  },

  recursion_get_dom : function(ele){

    var params = {};

    var data_type = "";

    var bd = null;

    var skip_children = false;

    var view_map;

    params.broadcast_list = [];
    params.broadcast_list.push(closure(this, this.dom_event));

    params.from_bind_dom = this.from_bind_dom;

    if(Backbone.BindDom.isBindDom(ele)){

      data_type = Backbone.BindDom.elementDataType(ele);

      if(data_type == "view"){

        skip_children = true;

        view_map = Backbone.BindView.ele_view_map[Backbone.BindDom.elementViewMap(ele)];

        if(!params.view_map){
          return;
        }

        params.view_broadcast_index = view_map.view_broadcast_index;

        params.view = view_map.view;

        params.type = "view";

        params.data_bind = Backbone.BindDom.elementDataBind(ele);

        params.range = ele;

        params.scope = true;

      }
      else if(data_type == "view_collection"){

        skip_children = true;

        view_map = Backbone.BindView.ele_view_map[Backbone.BindDom.elementViewMap(ele)];

        if(!params.view_map){
          return;
        }

        params.view_broadcast_index = view_map.view_broadcast_index;

        params.bind_views_options = view_map.bind_views_options;

        params.view = view_map.view;

        params.type = "view_collection";

        params.data_bind = Backbone.BindDom.elementDataBind(ele);

        params.scope = true;

      }
      else{

        params.type = "jq_dom";

        params.selector = ele;

      }

      bd = new Backbone.BindDom(params);

      this.bind_doms.push(bd);

    }

    if(skip_children){
      return;
    }

    var child = $(ele).children();

    var _this = this;

    if(child.length > 0){
      _.each(child, function(content, index){
        _this.recursion_get_dom(content);
      });
    }

  },

  get_dom_on_view : function(range){

    if(!this.view){
      return null;
    }

    this.recursion_get_dom(range);

  }

});
//


/*
* BindViewCollection
* it also wraps a view , but this view contains views
* BindViewCollection always maps to a collection or model elements (Backbone.Collection or model.xxx  xxx is {..} which contain {..}
*/
Backbone.BindViewCollection = function(param){

  if(!param){
    return;
  }

  if(!param.view instanceof Backbone.View) {
    return;
  }

  this.data_bind = "";

  this.bind_views = [];

  this.view_broadcast_index = "";

  this.view_create_index = "";

  this.broadcast_list = [];

  this.from_bind_dom = false;

  this.from_bind_dom = param.from_bind_dom;

  this.view = param.view;

  this.data_bind = param.data_bind ? param.data_bind : "";

  this.bind_views_options = param.bind_views_options;

  if(param.scope){
    this.get_view_on_view();
  }

  this.view_broadcast_index = param.view_broadcast_index ? param.view_broadcast_index : "view_event";

  this.view_create_index = param.view_create_index ? param.view_create_index : "create_view";

  var _this = this;

  if(param.broadcast_list){
    _.each(param.broadcast_list, function(content, index){
      _this.broadcast_list.push(content);
    });
  }

  this.bind();
};

Backbone.BindViewCollection.isBindViewCollection = function(ele){
  return (ele instanceof Backbone.BindViewCollection);
};

_.extend(Backbone.BindViewCollection.prototype, {

  view : {},

  data_bind : null,

  data_type : "BindViewCollection",

  bind_views_options : {},
  bind_views : null,

  view_broadcast_index : null,
  view_create_index : null,

  broadcast_list : null,

  from_bind_dom : null,

  get_val : function(){

    return this.bind_views;

  },

  set_val : function(model){

    var next_model = model;

    _.each(this.bind_views, function(content, index){

      if(content.from_bind_dom){
        next_model = next_model[content.data_bind];
      }
      else{
        next_model = next_model.get(content.data_bind);
      }

      content.set_val(next_model);

    });

  },

  remove : function(){
    this.view.remove();
  },

  find_data_bind : function(data_bind){

    if(this.data_bind == data_bind){
      return this;
    }

    var result = null;
    var temp = null;

    _.each(this.bind_views, function(content, index){

      temp = content.find_data_bind(data_bind);

      result = temp ? temp : result;

    });

    return result;

  },

  find_data_bind_in_bind_view : function(data_bind){

    var index = -1;

    _.each(this.bind_views, function(content, ind){

      if(content.data_bind == data_bind){
        index = ind;
      }

    });

    return index;

  },

  broadcast : function(event, option){

    if(typeof this.view[this.view_broadcast_index] == "function"){
      this.view[this.view_broadcast_index](event, option);
    }

    _.each(this.broadcast_list, function(content, index){
      if(typeof content == "function"){
        content(event, option);
      }
    });

  },

  view_event : function(event, option) {

    var opt = {
      child : option,
      current : this
    };

    this.broadcast(event, opt);

    if(event == "remove"){
      if(!option.child){
        var index = this.find_data_bind_in_bind_view(opt.current.data_bind);
        this.bind_views.splice(index, 1);
      }
    }

  },

  on_remove : function(event, view){
    this.unbind();
    this.broadcast("remove", {current : this});
    this.view = null;
  },

  bind : function(){

    this.view.on("remove", this.on_remove, this);

  },

  unbind : function(){

    this.view.off("remove");

  },

  create_view : function(model){

    if(!this.view[this.view_create_index]){
      return null;
    }

    var params = {};

    params.view = this.view[this.view_create_index]();

    params.data_bind = model.cid;

    params.scope = true;

    params.broadcast_list = [];
    params.broadcast_list.push(closure(this, this.view_event));

    var BV = new Backbone.BindView(params);

    this.bind_views.push(BV);

    BV.set_val(model);

    return BV;
  },

  get_view_on_view : function(){

    var options = this.bind_views_options;

    var collection = this.view[options.index];

    if(!collection){
      return;
    }

    var _this = this;

    _.each(collection, function(content, index){

      var params = {};
      var BV = null;

      params.from_bind_dom = _this.from_bind_dom;

      if(Backbone.BindView.isView(content)){

        params.view = content;

        if(options.data_bind){
          params.data_bind = content[options.data_bind];
        }

        if(options.view_broadcast_index){
          params.view_broadcast_index = content[options.view_broadcast_index];
        }

        if(options.scope){
          params.scope = content[options.scope];
        }

        if(options.range){
          params.range = content[options.range];
        }

        params.broadcast_list = [];

        params.broadcast_list.push(closure(_this, _this.view_event));

        BV = new Backbone.BindView(params);

        _this.bind_views.push(BV);

      }

    });

  }

});
//


/*
* TowWayBind
* this class listen to both model and bind views
* it syncs model and view
*/
Backbone.TowWayBind = function(view_option, model_option){

  if(!view_option || !model_option){
    return;
  }

  this.on_change_list = {};

  var vo = view_option;
  if(!vo.broadcast_list){
    vo.broadcast_list = [];
  }
  vo.broadcast_list.push(closure(this, this.on_event));

  if(view_option.type == "BindView"){
    this.view_tar = new Backbone.BindView(vo);
  }
  else if(view_option.type == "BindViewCollection"){
    this.view_tar = new Backbone.BindViewCollection(vo);
  }
  else{
    return;
  }

  this.model_tar = model_option.model;

  if(view_option.scope){
    this.sync_all_view();
  }

  this.listen();

};

_.extend(Backbone.TowWayBind.prototype, {

  view_tar : {},

  model_tar : {},

  on_event : function(event, option){

    if(event == "change"){
      this.sync_model(this.model_tar, option);
    }
    else if(event == "remove"){
      this.remove_model(this.model_tar, option);
    }

  },


  /*listen to the model and get the changed index*/
  on_change : function(index, model, change, option){
    if(option.unset){
      this.delete_dom(index, model);
    }
    else{
      this.sync_view(index, model, change);
    }
  },
  on_change_wrap : function(index){

    var _this = this;

    return function(model, change, option){
      _this.on_change(index, model, change, option);
    }

  },
  on_change_list : null,

  on_add : function(model, collection, option){

    this.view_tar.create_view(model);

  },

  on_remove : function(model, collection, option){

    var tar = this.view_tar.find_data_bind(model.cid);
    console.log(tar);
    tar.remove();

  },




  delete_dom : function(index, model){

    var content = this.view_tar.find_data_bind(model.cid);

    if(!content){
      content = this.view_tar;
    }

    var ele = content.find_data_bind(index);

    ele.remove();

  },

  sync_view : function(index, model, change){

    var content = this.view_tar.find_data_bind(model.cid);

    if(!content){
      content = this.view_tar;
    }

    var ele = content.find_data_bind(index);

    ele.set_val(change);

  },

  remove_model : function(model, option, parent){

    var p = parent;

    var opt = option.child;

    var current = option.current;

    var next_model = model;

    var _this = this;

    if(!opt){

      if(!parent){
        return;
      }

      if(current.data_type == "view" || current.data_type == "view_collection"){
        return;
      }

      if(current.from_bind_dom){
        delete parent[current.data_bind];
      }
      else if(current.data_type == "BindView"){
        parent.remove(current.data_bind, {silent : true});
      }
      else if(current.data_type == "BindViewCollection"){
      }
      else{
        parent.unset(current.data_bind, {silent : true});
      }

    }
    else{

      p = model;

      if(opt.current.data_bind != ""){
        if(opt.current.from_bind_dom){
          next_model = model[opt.current.data_bind];
        }
        else{
          next_model = model.get(opt.current.data_bind);
        }
      }
      else{
        return;
      }

      _this.remove_model(next_model, opt, p);

    }

  },

  sync_model : function(model, option, parent){

    var p = parent;

    var opt = option.child;

    var current = option.current;

    var next_model = model;

    var _this = this;

    if(!opt){

      if(!parent){
        return;
      }

      if(current.from_bind_dom){
        parent[current.data_bind] = current.get_val();
      }
      else{
        parent.set(current.data_bind, current.get_val(), {silent : true});
      }

    }
    else{

      p = model;

      if(opt.current.data_bind != ""){
        if(opt.current.from_bind_dom){
          next_model = model[opt.current.data_bind];
        }
        else{
          next_model = model.get(opt.current.data_bind);
        }
      }
      else{
        return;
      }

      _this.sync_model(next_model, opt, p);

    }

  },

  sync_all_view : function(){

    this.view_tar.set_val(this.model_tar);

  },

  listen : function(){

    var _this = this;

    if(Backbone.Model.isModel(this.model_tar)){

      _.each(this.model_tar.attributes, function(content, index){

        if(typeof content != "function"){
          _this.on_change_list[index] = _this.on_change_wrap(index);
        }

        _this.model_tar.on("change:" + index, _this.on_change_list[index]);

      });

    }
    else if(Backbone.Collection.isCollection(this.model_tar)){

      this.model_tar.on("add", this.on_add, this);
      this.model_tar.on("remove", this.on_remove, this);

      _.each(this.model_tar.model.attributes, function(content, index){

        if(typeof content != "function"){
          _this.on_change_list[index] = _this.on_change_wrap(index);
          _this.model_tar.model.on("change:" + index, _this.on_change_list[index]);
        }

      });

    }

  },

  stop_listen : function(){

    var _this = this;

    if(Backbone.Model.isModel(this.model_tar)){

      _.each(this.on_change_list, function(content, index){
        if(typeof content != "function"){
          _this.model_tar.off("change:" + index);
        }
      });

    }
    else if(Backbone.Collection.isCollection(this.model_tar)){

      _.each(this.on_change_list, function(content, index){
        if(typeof content != "function"){
          _this.model_tar.model.off("change:" + index);
        }
      });

      this.model_tar.off("add");
      this.model_tar.off("remove");

    }

  }

});


