// 沪深300 和中证500 指数
var csi300 = {
	current: -1,
	previous: -1,
	increase: -1,
};

var zz500 = {
	current: -1,
	previous: -1,
	increase: -1,
};

// 计算 current 相比 previous 增长百分比
function increasePercent(previous, current) {
	return (current / previous - 1) * 100;
}

// 获取指数当前价格
function getCurrentQuote() {
	var s = document.createElement('script');
	s.src = 'http://qt.gtimg.cn/q=sh000300,sh000905';
	s.onload = function () {
		// console.log(s.src, 'loaded');
		csi300.current = parseFloat(v_sh000300.split('~')[3]);
		zz500.current = parseFloat(v_sh000905.split('~')[3]);

		selectNext28();
	};
	$('head').append(s);
}

// 比较最近 N 周的涨幅，则获取回退 N 周时的收盘价
var LOOK_BACK_N_WEEK = 4;

// stock: sh000300, sh000905
function getNWeekBeforeClose(stock, nweek, callback) {
	var s = document.createElement('script');
	s.src = [ 'http://data.gtimg.cn/flashdata/hushen/weekly/', stock, '.js'].join('');
	s.onload = function () {
		// console.log(s.src, 'loaded');
		// 周线数据按时间排序，最后一行无数据
		var weekly = weekly_data.split('\n');
		weekly_data = null;
		var quote = weekly[weekly.length - 2 - nweek];
		var close = parseFloat(quote.split(' ')[2]);
		callback(close);

		selectNext28();
	};
	$("head").append(s);
}

// 获取指数往前 4 周时的收盘价（本周也算在内）
function getPreviousQuote() {
	getNWeekBeforeClose('sh000300', LOOK_BACK_N_WEEK, function(quote) {
		csi300.previous = quote;
	});
	getNWeekBeforeClose('sh000905', LOOK_BACK_N_WEEK, function(quote) {
		zz500.previous = quote;
	});
}

function calculateIncrease() {
	csi300.increase = increasePercent(csi300.previous, csi300.current);
	zz500.increase = increasePercent(zz500.previous, zz500.current);
}

function updateUI() {
	// 更新页面指数当前价格
	$('#csi300Current').text(csi300.current.toFixed(2));
	$('#zz500Current').text(zz500.current.toFixed(2));

	// 更新页面指数过去价格
	$('#csi300Previous').text(csi300.previous.toFixed(2));
	$('#zz500Previous').text(zz500.previous.toFixed(2));

	// 更新指数增幅
	$('#csi300Increase').text(csi300.increase.toFixed(2) + '%');
	$('#zz500Increase').text(zz500.increase.toFixed(2) + '%');

	// 更新选择指数，高亮指数所在行
	if (zz500.increase > csi300.increase) {
		console.log("select zz500");
		$('#zz500Tr').addClass('am-danger');
		$('#csi300Tr').removeClass('am-danger');
		$('#next28').text('中证500 指数');
	} else {
		console.log("select csi300");
		$('#csi300Tr').addClass('am-danger');
		$('#zz500Tr').removeClass('am-danger');
		$('#next28').text('沪深300 指数');
	}
}

// 获取数据，计算涨幅，选择下一周的指数
function selectNext28() {
	// 若价格还未加载完成，直接返回
	if ((csi300.current === -1) ||
		(zz500.current === -1) ||
		(csi300.previous === -1) ||
		(zz500.previous === -1))  {
		return;
	}

	calculateIncrease();
	updateUI();
}

// 当页面元素加载完毕
$(document).ready(function() {
	getPreviousQuote(); // 只需执行一次
	getCurrentQuote();

	$('#refresh').on('click', function() {
		getCurrentQuote();
	});
});
