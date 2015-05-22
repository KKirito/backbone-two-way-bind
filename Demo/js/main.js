var count = 0;

var items = 0;

var taskModel = Backbone.Model.extend({

  defaults : {
    id : "",
    task : ""
  }

});

var taskCollection = Backbone.Collection.extend({

  model : taskModel

});

var task_collection = new taskCollection;

var taskUnit = Backbone.View.extend({

  el : ".tasks-content",

  range : {},

  initialize : function(){

    var temp = $("#task-unit").html();
    this.$el.append(temp);

    this.range = this.$el.children().last();

    this.el = this.range;
    this.$el = $(this.range);

  }

});

var tasksView = Backbone.View.extend({

  el: ".tasks-content",

  list : [],

  create_view : function(){
    var temp = new taskUnit();
    this.list.push(temp);
    return temp;
  },

  initialize : function(){

  }

});

var task_view = new tasksView();

var twb = new Backbone.TowWayBind({
  type : "BindViewCollection",
  view : task_view,
  scope : false
},{model : task_collection});


function setItem(){
  $("#items").html(items);
}

function addTask(tar){

  count ++;

  items ++;

  setItem();

  var val = _.clone($(tar).val());

  task_collection.add({id : count, task : val});

  $(tar).val("");

}

function clearAll(){

  while(task_collection.length > 0) {
    task_collection.pop();
  }

  items = 0;

  setItem();

}

function removeTask(tar){

  var target = $(tar).parent();
  var parent = $(target).parent();
  parent = parent.children();

  var _index = -1;

  for(var i = 0; i < parent.length; i ++){
    if($(parent[i]).html() == $(target).html()){
      _index = i;
    }
  }

  task_view.list[_index].remove();
  task_view.list.splice(_index, 1);

  items --;
  setItem();

}

function change_task(tar){

  $(tar).parent().siblings("input").css("display", "block");

}

function changed_task(tar){

  var val = $(tar).val();

  $(tar).siblings(".task-label").find("span").html(val);

  $(tar).siblings(".task-label").find("span").change();

  $(tar).val("");

  $(tar).css("display", "none");

}

