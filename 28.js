// 沪深300 和中证500 指数
var csi300_current = 0;
var zz500_current = 0;

var csi300_previous = 1;
var zz500_previous = 1;

var csi300_increase = 0;
var zz500_increase = 0;

// 计算 current 相比 previous 增长百分比
function increasePercent(previous, current) {
	return (current / previous - 1) * 100;
}

// 获取指数当前价格
function getCurrentQuote() {
	$.ajax({
		url: 'http://hq.sinajs.cn/list=sh000300,sh000905',
		async: false,
		success: function (data) {
			var arr = data.split('\n');
			csi300_current = parseFloat(arr[0].split(',')[3]);
			zz500_current = parseFloat(arr[1].split(',')[3]);
		},
		error: function(xhr, errType, error) {
			alert("Failed to current stock quote.");
		}
	});
}

// 获取指数过去价格
function getPreviousQuote() {
}

function calculateIncrease() {
	csi300_increase = increasePercent(csi300_previous, csi300_current);
	zz500_increase = increasePercent(zz500_previous, zz500_current);
}

function updateUI() {
	// 更新页面指数当前价格
	$('#csi300_current').text(csi300_current.toFixed(2));
	$('#zz500_current').text(zz500_current.toFixed(2));

	// 更新页面指数过去价格
	$('#csi300_previous').text(csi300_previous.toFixed(2));
	$('#zz500_previous').text(zz500_previous.toFixed(2));

	// 更新指数增幅
	$('#csi300_increase').text(csi300_increase.toFixed(2) + '%');
	$('#zz500_increase').text(zz500_increase.toFixed(2) + '%');

	// 更新选择指数，高亮指数所在行
	if (zz500_increase > csi300_increase) {
		console.log("select zz500");
		$('#zz500_tr').addClass('am-danger');
		$('#csi300_tr').removeClass('am-danger');
		$('#next28').text('中证 500 指数');
	} else {
		console.log("select csi300");
		$('#csi300_tr').addClass('am-danger');
		$('#zz500_tr').removeClass('am-danger');
		$('#next28').text('沪深 300 指数');
	}
}

// 获取数据，计算涨幅，选择下一周的指数
function selectNext28() {
	getCurrentQuote();
	calculateIncrease();
	updateUI();
}

// 当页面元素加载完毕
$(document).ready(function() {
	// 只需执行一次
	getPreviousQuote();

	selectNext28();

	$('#refresh').click(function() {
		selectNext28();
	});
});
