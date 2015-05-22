#Backbone-TowWayBind Manual#
##Description##
* ###model and collection###
  just create these as usual
  </br>
        
        var taskModel = Backbone.Model.extend({
          defaults : {
            id : "",
            task : ""
          }
        });
  
* ###view###
  when create a _view_ or initialize a _view_ collection
  the _TwoWayBind_ will search the dom to create the _BindDom_
  element. 
  <br>
  It will first search `range`  if there is no `range`,
  then it will search `$el`. 
  <br>
  So please remember to set `range` or `el`.  
  <br>
  And also, when remove a view, it will remove all elements
  in `$el` just as `$el.remove();`. It's important to write a 
  right `el`.


* ###view collection###
  _view_ collection is also a _Backbone.View_. But it contains _views_
  <br>
  view collection needs a function named `create_view()`. It should
  have a return value which is the view you have just created. You 
  can also change the name of this function. I will descripe it later

* ###html###
  when scope the dom. all the dom that has `data_type` and `data_bind`
  will be warpped by BindDom.

##Functions##
* ###Backbone.TowWayBind###
  this is the only function that you need to write.
  <br>
  It has two params. `view_potion` and `model_option`.
  <br>
  <br>
  `model_option` is simple. it should have one property
  named `model` which contains _model_ or _collection_.
  <br>
  <br>
  `view_option` is more complex. 
  <br> 
  <br>
  When it is a _view_. Params are :
  <br>
  `type` : show this view's type.
  <br>
  `from_bind_dom`: sign if it is relies on a _BindDom_ . `bool`
  <br>
  `view` : the target _view_ to bind. _required_ 
  <br>
  `data_bind` : the index that the view map to the _model_. `bool`
  <br>
  `view_broad_cast_index` : when this view get a broadcast. It will
  call `view[view_broad_cast_index]` to send the broadcast. default
  is `bind_view_event`. And the function has two params. `event` and 
  `option`.  `option` is `{child:{}, current:{}}`. if `child` is `undefined`
  the `current` is the man who first broadcast the event.
  <br>
  `range` : `range` is the flag to tell TwoWayBind where to search the _doms_
  if it is none, it will display as we talked. 
  <br>
  `scope` : whether to search and find element.
  <br>
  <br>
  When it is a view collection, some params is the same, so here only list
  the different
  <br>
  <br>
  `bind_view_options` : if this _view_ has some always occur _view_, _TwoWayBind_
  can also scope these _views_ and bind via `bind_view_options`. So it should
  contains : 
  <br>
  `index` : at `view.index` to find the occrued _views_
  <br>
  `data_bind` : at `occured_view.data_bind` to find the data_bind.
  <br>
  then they are the same. And the params are:
  `view_broadcast_index`, `scope`, `range`.
  <br>
  <br>
  `view_create_index` : if you don't like the default value, set this
  param to change.
  

##Attention##
1. when remove a _dom_, you can use whatever you like. But when change a 
   _dom_ 's value, if it is not a _input_, please remember to raise `change`.
   like this.
   
         $(tar).siblings(".task-label").find("span").html(val);

         $(tar).siblings(".task-label").find("span").change();
         
2. when remove a _view_, please use the `remove` function. 
   <br>
   And please note that `remove` will remove all the elements
   in `$el`.


##Doms##
+  doms should have properties : `data_bind` and `data_type`
   <br>
   usually `data_type` equal to doms' type. like `img`, `input` or ...
   <br>
   <br>
   if you want to create a new _view_ on this _dom_, set `data_type` as
   "view" or "view_collection". 
   <br>
   And now , it's `data_bind` refers to a _Object_ =>`{...}` in model or model      property; 
   <br>
   If you do this, you should set a `view_map` property on your dom.
   the _value_ of the property is equal to the map in `Backbone.BindView.ele_view_map`. And the value of `Backbone.BindView .ele_view_map[view_map]` is the view you already created and need to bind;
   <br>
   Demo like this : 

        <div data_type="view" data_bind="img_content" view_map="img_view">
            ....
        </div>
        
        var iv = Backbone.View.extend({
           .....
        });
        
        
        var viewUnit = Backbone.View.extend({
           ......
           
           initialize : function(..){
              /*---create doms ----*/
              var img_view = new iv(..);
              Backbone.BindView.ele_view_map[img_view] = img_view;
           }
        });
        
        var viewCollection = Backbone.View.extend({
            ......
            
            create_view : function(){
               return new viewUnit();
            }
        
        });
        
        var view_collection = new viewCollection(...);
        
        var twb = Backbone.TwoWayBind(....); //bind view_collection



###end###
+ by redhome-xiaoqi
  
