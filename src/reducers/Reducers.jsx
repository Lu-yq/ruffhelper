import {combineReducers}from 'redux';
var cfg = require('../config');//
import {save} from '../lib/FileUtil';
import {INIT,LEFT_CHANGE_CLUMTYPE,LOG_ADD,LOG_CLEAN,OPEN_RUFF_PROJECT,REMOVE_RUFF_PROJECT} from '../actions/AppActions.jsx';
import {List} from 'immutable';
var appPath = '';
let initConfig = {
    language: '',//语言默认中文 zh_CN
    // rapVersion: "",//rap 版本号
    // rapVersionDec: "",//版本号的描述信息  比如:未安装rap
    osType: "",//操作系统 Windows Mac
    appPath: '',//应用的路径
    ruffProjectPath: '',//要打开的ruff项目的路径
    // ruffSDKLocation: '',//sdk的位置
    histrory: List([]),// 打开的历史记录，最多10个 {name:'',path:''}
    // autoCmdLog: false,//命令行区域自动滚屏
    // autoRapLog: true,//rap log 区域自动滚屏
    ip: '',//本机ip
    port: ''//rap log 服务器用的端口
}
var config = function (state = initConfig, action) {
    var result = Object.assign({}, state);
    // console.log('action.type:',action.type)
    switch (action.type) {
        case INIT:
            result = Object.assign({}, result, action.data);
            result.histrory = List(action.data.histrory);
            cfg.saveData.ruffSDKLocation = result.ruffSDKLocation;
            cfg.saveData.histrory = result.histrory;
            if (action.data.histrory && action.data.histrory.length > 0) {//默认打开第一个项目
                //console.log(result.histrory.get(0).path)
                result.ruffProjectPath = action.data.histrory[0].path;
            }
            appPath = result.appPath;
            return result;
        case OPEN_RUFF_PROJECT:
            var histrory = result.histrory.unshift(action.data);//把最后打开的放在最上面
            var openPath = action.data.path;
            for(var i=1,len=histrory.size;i<len;i++){
                console.log(i,histrory.get(i))
                if(openPath == histrory.get(i).path){
                    histrory = histrory.delete(i);
                    break;
                }
            }
            if (histrory.size > 20) {
                histrory = histrory.slice(0, 20);
            }
            result.histrory = histrory;
            result.ruffProjectPath = openPath;
            cfg.saveData.histrory = histrory;
            saveConfig();
            return result;
        case REMOVE_RUFF_PROJECT:
            var deletePath = action.data.path;
            var histrory = result.histrory;
            for (var i = 0, len = histrory.size; i < len; i++) {

                if (deletePath == histrory.get(i).path) {
                    result.histrory = histrory.delete(i);
                    break;
                }
            }
            cfg.saveData.histrory = result.histrory;
            saveConfig();
            return result;
    }
    return result;
}
var saveConfig = function () {
    //console.log('save:',appPath,saveData)
    //console.log(cfg.saveData)
    //save(appPath + '\\config\\ruffhelper.cfg',cfg.saveData);
    save(cfg.configPath, cfg.saveData);
}
let initLeft={
    clum1:0,//每个栏目的打开状态 0关闭 1打开 2关闭中
    clum2:1,
    clum3:1
}
var left = function (state=initLeft,action) {
    var result = Object.assign({},state);
    switch (action.type){
        case LEFT_CHANGE_CLUMTYPE:
            result['clum'+action.data.key] = action.data.value
            // console.log('left:',result)
            return result;
    }
    return result;
}
var logContent = function (state=[],action) {
    // var result = Object.assign({},state);
    var result = List(state);
    // console.log('logContent:',result,action)
    switch (action.type){
        case LOG_ADD:
            // result.push(action.data);
            result = result.push(action.data)
            return result;
        case LOG_CLEAN:
            return [];
        default:
            return state;
    }
}
const appreducer = combineReducers({
    config,left,logContent
});
export default appreducer;