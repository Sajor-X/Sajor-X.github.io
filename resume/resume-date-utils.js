/**
 * Created by maotingfeng on 16/7/27.
 */
(function( factory ){
    var md = typeof define == "function" ;
    if( typeof module === 'object' && typeof module.exports === 'object' ){
        module.exports = factory() ;
    }else if( md && define.amd ){
        define( ['require','jquery'] , factory ) ;
    }else if( md && define.cmd ) {
        define( 'ymdate' , ['jquery'] , factory ) ;
    }else{
        factory( function(){ return window.jQuery } ) ;
    }
})(function( require ){
    var $ = require('jquery') ,
        _cache = {} ,
        tool = {
            guid: function(){
                function S4() {
                    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                };
                return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()) ;
            } ,
            padNumber: function(num, fill) {
                var len = ('' + num).length;
                return (Array(
                    fill > len ? fill - len + 1 || 0 : 0
                ).join(0) + num);
            } ,
//            checkYmdate: function( value ) {
//                var ymdateReg = /^\d{4}(-|\/)\d{1,2}$/g ;
//                return ymdateReg.test( value ) ;
//            }
        } ;
    function ymdate( config ){
        var $this = $( this ) ,
            isBind = false ,
            $document = $( document ) ,
            _clicks = $._data( $document[0] , "events" ) ,
            clicks = _clicks && _clicks.click ,
            _config = $.extend( { onpicked: $.noop } , config ) ;   // 用户配置参数
        // 设置
        this._ymdate = { config: _config , isUptonow: false };
        $this.on( "click" , function( ev ){
            showDatePanel.call( this ) ;
            ev.stopPropagation() ;
        } ) ;
        // 点击其他区域 日期消失
        if( clicks ){
            $.each( clicks , function( index , val ){
                if( val.namespace == "ymdate" ){
                    isBind = true ;
                }
            } ) ;
        }
        if( isBind ){}
        else{
            $document.on( "click.ymdate" , function( ev ){
                var $target = $( ev.target ) ;
                if( $target.closest(".ymdate_layer").length > 0 ){}
                else{
                    $.each( $.data( _cache ) , function( guid , $ymdate_layer ){
                        $ymdate_layer.remove() ;
                        $.removeData( _cache , guid ) ;
                    } ) ;
                }
            } ) ;
        }
    } ;
    function showDatePanel(){
        var that = this ,
            $input = $( this ) ,
            originalValue = $.trim( $input.text() ) ,
            $body = $("body") ;
        that._ymdate.beginYear = undefined ;
        that._ymdate.beginMonth = undefined ;
        that._ymdate.endYear = undefined ;
        that._ymdate.endMonth = undefined ;
        if(originalValue!=""){
        	var time=originalValue.replace(/年/g, ".").replace(/月/g, ".").replace(/\s*/g, "").split("-") ;
        	if(time[0]!=undefined){
        		if(time[0].indexOf(".")>0){
        			that._ymdate.beginYear = time[0].split(".")[0];
        			that._ymdate.beginMonth = time[0].split(".")[1];
        		}
        	};
        	if(time[1]!=undefined){
        		if(time[1].indexOf(".")>0){
        			that._ymdate.endYear = time[1].split(".")[0];
        			that._ymdate.endMonth = time[1].split(".")[1];
        		}
        		if(time[1]=="至今"){
        			$.extend( that._ymdate , { isUptonow: true } ) ;
        			that._ymdate.endYear="至今";
        		}
        		if(time[1]=="present"){
        			$.extend( that._ymdate , { isUptonow: true } ) ;
        			that._ymdate.endYear="present";
        		}
        	}
        }
        var offset = (function(){
            var offset = $input.offset() ,
                size = { w: $input.outerWidth() , h: $input.outerHeight() } ;
            return {
                top: offset.top + size.h ,
                left: offset.left ,
                width: size.w ,
                height: size.h
            }
        })();
        generateHtml() ;
        function generateHtml(cls){
            var isExist = false ,
                $exist_ymdate_layer = $(".ymdate_layer") ;
            $exist_ymdate_layer.each( function(){
                var $this = $(this) ,
                    guid = $.trim( $this.data("guid") ) ;
                if( guid == that._ymdate.guid ){ isExist = true ; return false ; }
                else{ removeYmdate( guid ) ; }
            } ) ;
            if( isExist === true ){ return false; }

            // 生成新的时间控件
            var guid = tool.guid() ,
                ymdate_layer = '<div class="ymdate_layer" data-guid=' + guid + '><div class="begin_date ymdate_layer_item"><ul class="ymdate_year"></ul><ul class="ymdate_month"></ul></div><div class="end_date ymdate_layer_item"><ul class="ymdate_year"></ul><ul class="ymdate_month"></ul></div></div>' ,
                html_year = '' ,
                now = new Date() ,
                now_year = now.getFullYear()+4 ,
                now_month = now.getMonth() ,
                previous_year = that._ymdate.beginYear ,
                previous_month = that._ymdate.beginMonth ,
                end_year=that._ymdate.endYear;
                end_month=that._ymdate.endMonth;
                limit = (function(){
                    var _limit = that._ymdate.config ,
                        max = ( _limit.max || "" ).split("-") ,
                        max_year = $.trim( max[0] ) ,
                        max_month = $.trim( max[1] ) ,
                        min = ( _limit.min || "" ).split("-") ,
                        min_year = $.trim( min[0] ) ,
                        min_month = $.trim( min[1] ) ;
                    var now = new Date() ,
                        now_year = now.getFullYear() ,
                        now_month = now.getMonth() + 1 ;
                    max_year = max_year == "" ? "" : Number( max_year ) ;
                    max_month = max_month == "" ? "" : Number( max_month ) ;
                    min_year = min_year == "" ? "" : Number( min_year ) ;
                    min_month = min_month == "" ? "" : Number( min_month ) ;

                    // 如果没有设置最大值，默认最大值为当前
                    max_year = max_year == "" ? now_year : max_year ;
                    max_month = max_month == "" ? now_month : max_month ;
                    return {
                        max_year: max_year ,
                        max_month: max_month ,
                        min_year: min_year ,
                        min_month: min_month
                    }
                })() ,
                $ymdate_layer = $( ymdate_layer ) ,
                $ymdate_year = $ymdate_layer.find(".ymdate_year") ,
                $ymdate_month = $ymdate_layer.find(".ymdate_month") ;
            // 年份
            if( that._ymdate.config.uptonow === true ){                                 // 是否显示至今
            	var language=$("#resume_main").attr("data_language");
            	if(language==undefined||language==""){
            		language="zh";
            	}
            	if(language=="en"){
            		html_year += '<li class="uptonow"><span>present</span></li>' ;
            	}else{
            		html_year += '<li class="uptonow"><span>至今</span></li>' ;
            	}
            }
            for (var i = now_year ; i >= ( now_year - 44 ) ; i-- ) {
                html_year += '<li date-val="' + i + '">' + i + '</li>';
            } ;
            $ymdate_year.html( html_year ) ;
            
            // 月份
            function generateMonth( year ){
                var html_month = '';
                // 月份
                for (var i = 1 ; i <= 12 ; i++) {
                    html_month += '<li date-val="' + i + '"><span>' + i + '月</span></li>';
                } ;
                $ymdate_month.html( html_month ) ;
            }
            generateMonth();
            if($input.length>0){
            	$input.closest("span.time").after($ymdate_layer.css({
            			"position": "absolute",
            			"margin-top": "22px",
            			"margin-left": "-2px"
            				}));
            }else{
            	$ymdate_layer.css({
                    "position": "absolute" ,
                    "left": offset.left + "px" ,
                    "top": offset.top + "px"
                }).appendTo( $body ) ;
            }
            
            // 存储数据
            $.data( _cache , guid , $ymdate_layer ) ;
            $.extend( that._ymdate , { guid: guid } ) ;
            // 绑定事件
            $ymdate_layer.on( "click" , ".ymdate_year li" , function( ev , type ){
                var $this = $( this ) ,
                    guid = $.trim( $this.closest(".ymdate_layer").data("guid") ) ;
                if( $this.hasClass("uptonow") ){
                    $.extend( that._ymdate , { isUptonow: true } ) ;
                    that._ymdate.endYear = undefined ;
                    that._ymdate.endMonth = undefined ;
                    fillInput("uptonow") ;
                    removeYmdate( guid ) ;
                    return false ;
                }
                var year = $.trim( $this.text() ) ;
                $this.addClass("active").siblings(".active").removeClass("active") ;
                if($this.closest(".end_date.ymdate_layer_item").length>=1){
                	$.extend( that._ymdate , { endYear: year , isUptonow: false } ) ;
                }else{
                	$.extend( that._ymdate , { beginYear: year , isUptonow: false } ) ;
                }
                fillInput();
                ev.stopPropagation() ;
            } ).on( "click" , ".ymdate_month li" , function( ev ){
                var $this = $( this ) ,
                    month = $.trim( $this.text() ).replace(/月/g,"") ;
                guid = $.trim( $this.closest(".ymdate_layer").data("guid") ) ;
                if($this.closest(".end_date.ymdate_layer_item").length>=1){
                	 $.extend( that._ymdate , { endMonth: tool.padNumber( month , 2 ) , isUptonow: false } ) ;
                }else{
                	 $.extend( that._ymdate , { beginMonth: tool.padNumber( month , 2 ) , isUptonow: false } ) ;
                }
                $this.addClass("active").siblings(".active").removeClass("active") ;
                fillInput() ;
                if($this.closest(".end_date.ymdate_layer_item").length>=1){
                	 removeYmdate( guid ) ;
                }
                ev.stopPropagation() ;
            } ) ;
            
            // 如果有年份，默认跳转到选中的位置
            if( previous_year != undefined ){
            	$(".begin_date.ymdate_layer_item").find('.ymdate_year li[date-val="'+previous_year+'"]').addClass("active");
            }
            if( previous_month != undefined ){
            	if(previous_month.indexOf("0")==0){
            		previous_month=previous_month.replace("0","");
            	}
            	$(".begin_date.ymdate_layer_item").find('.ymdate_month li[date-val="'+previous_month+'"]').addClass("active");
            }
            if( end_year != undefined ){
            	$(".end_date.ymdate_layer_item").find('.ymdate_year li[date-val="'+end_year+'"]').addClass("active");
            }
            if( end_month != undefined ){
            	if(end_month.indexOf("0")==0){
            		end_month=end_month.replace("0","");
            	}
            	$(".end_date.ymdate_layer_item").find('.ymdate_month li[date-val="'+end_month+'"]').addClass("active");
            }
            if(that._ymdate.isUptonow === true){
            	$(".end_date.ymdate_layer_item").find('.ymdate_year li.uptonow').addClass("active");
            }
            scrollActiveYear() ;
            // 显示区域显示选中的年份，并展示相应的月份
            function scrollActiveYear() {
            	var  $beginYear=$(".begin_date.ymdate_layer_item").find(".ymdate_year");
                var $active_year = $beginYear.find(".active") ,
                    index = $active_year.index() ;
                if( $active_year.length > 0 && !$active_year.hasClass("uptonow") ){
                    var height_p = $beginYear.innerHeight() ,
                        height_single = $active_year.outerHeight() ,
                        scrollTop = index * height_single ;
                    if( scrollTop >= height_p ){
                    	$beginYear.scrollTop( scrollTop - 2 * height_single ) ;
                    }
                }
                var $endYear=$(".end_date.ymdate_layer_item").find(".ymdate_year");
                	$active_year = $endYear.find(".active");
                    index = $active_year.index();
                if( $active_year.length > 0 && !$active_year.hasClass("uptonow") ){
                    var height_p = $endYear.innerHeight() ,
                        height_single = $active_year.outerHeight() ,
                        scrollTop = index * height_single ;
                    if( scrollTop >= height_p ){
                    	$endYear.scrollTop( scrollTop - 2 * height_single ) ;
                    }
                }
            }
            // 填充日期
            function fillInput( isUptonow ){
            	if(that._ymdate.beginYear==undefined||that._ymdate.beginYear==""){
                	that._ymdate.beginYear=new Date().getFullYear();
                }
            	if(that._ymdate.beginMonth==undefined||that._ymdate.beginMonth==""){
            		if(new Date().getMonth()<=9){
            			that._ymdate.beginMonth="0"+new Date().getMonth();
            		}else{
            			that._ymdate.beginMonth=new Date().getMonth();
            		}
                }
            	if(that._ymdate.endMonth==undefined || isUptonow == "uptonow"){
                 	that._ymdate.endMonth="";
                }
            	if(that._ymdate.endMonth!=undefined&&that._ymdate.endMonth!=""&&(that._ymdate.endYear==undefined||that._ymdate.endYear==""||that._ymdate.endYear=="至今"||that._ymdate.endYear=="present")){
            		that._ymdate.endYear=new Date().getFullYear();
            	}
                if(isUptonow == "uptonow" || that._ymdate.endYear==undefined||that._ymdate.endYear==""){
                	var language=$("#resume_main").attr("data_language");
                	if(language==undefined||language==""){
                		language="zh";
                	}
                	if(language=="en"){
                		that._ymdate.endYear="present";
                	}else{
                		that._ymdate.endYear="至今";
                	}
                }
                var date_formate=$("#resume_main").attr("date_formate");
                var startTime="";
                var endTime="";
                if(date_formate==undefined||date_formate=="" || date_formate=="yyyy-MM"){
                	startTime=that._ymdate.beginYear + '.' + that._ymdate.beginMonth;
                    endTime=that._ymdate.endYear
                    if(that._ymdate.endMonth!=undefined&&that._ymdate.endMonth!=""){
                    	endTime=endTime+ '.' +that._ymdate.endMonth;
                    }
                }else{
                	var endMonth=undefined;
                	var beginMonth=undefined;
                	if(that._ymdate.endMonth!=undefined && that._ymdate.endMonth.indexOf("0")==0){
                		endMonth=that._ymdate.endMonth.replace("0","");
                	}
                	if(that._ymdate.beginMonth!=undefined && that._ymdate.beginMonth.indexOf("0")==0){
                		beginMonth=that._ymdate.beginMonth.replace("0","");
                	}
                	if(beginMonth!=undefined){
                		startTime=that._ymdate.beginYear + '年' + beginMonth+ '月';
                	}else{
                		startTime=that._ymdate.beginYear + '年' + that._ymdate.beginMonth+ '月';
                	}
                    endTime=that._ymdate.endYear
                    if(endMonth!=undefined){
                    	endTime=endTime+ '年' +endMonth+ '月';
                    }else if(that._ymdate.endMonth!=undefined&&that._ymdate.endMonth!=""){
                    	endTime=endTime+ '年' +that._ymdate.endMonth+ '月';
                    }
                }
                var txt = startTime+' - '+endTime;
                $input.text( txt ) ;
                that._ymdate.config.onpicked( txt ) ;
            }
            // 关闭日期选择
            function removeYmdate( guid ){
                var $tmpl = $.data( _cache , guid ) ;
                if( $tmpl ){
                    $tmpl.remove() ;
                    $.removeData( _cache , guid ) ;
                }
                edit.resume_item.save();
            }
        }
    } ;

    // 绑定jquery方法
    $.extend( $.fn , {
        ymdate: function( config ){
            this.each( function(){
                ymdate.call( this , config ) ;
            } ) ;
        }
    } )
});