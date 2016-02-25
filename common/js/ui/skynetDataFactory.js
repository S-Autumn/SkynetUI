/**
 * Created by S_Autumn on 15-10-23.
 * TODO 使用HTML5 WebWork进行多线程数据处理
 * TODO 参数定义 任务调度
 * TODO 实际功能实现
 */

importScripts('../../common/js/jquery-1.8.3.js');
importScripts('../../common/js/common.js');
onmessage = function(e){
    debugger;
    var data = e.data;
    if(isEmpty(data)) return;
    $.each(data,function(i,item){
        if(isEmpty(item)) return true;
        if(item.ui=='skynetComborTree'){
            item.param.loader.update(item.param);
        }
    });
}




var worker = new Worker('work.js');
worker.onmessage =function(e){
    console.log('reuslt:'+ e.data);
}
worker.onerror =function(e){
    console.log('error:'+ e.message);
}
debugger;
worker.postMessage([{"ui":"skynetComborTree",param:function(){alert(1);}}]);