// Yahoo 的数据现在没有中证 500 指数的历史数据
// stock: 000300.SS, 000905.SS
function getNWeekBeforeClose(stock, nweek, callback) {
	var today = new Date();
	// 放假可能有一周时间不开盘，为确保能找到过去 n 周的收盘数据，多取几周的数据
	var startDate = new Date(today - (nweek + 2) * WEEK_MILLISECOND);
	var baseUrl = 'http://real-chart.finance.yahoo.com/table.csv?s=';
	var weeklyQuoteUrl = [
		baseUrl, stock,
		'&a=', startDate.getMonth(),
		'&b=', startDate.getDate(),
		'&c=', startDate.getFullYear(),
		'&d=', today.getMonth(),
		'&e=', today.getDate(),
		'&f=', today.getFullYear(),
		'&g=w&ignore=.csv'
	].join('');

	$.ajax({
		url: weeklyQuoteUrl,
		async: false,
		success: function (data) {
			var weekQuote = data.split('\n')[nweek];
			callback(parseFloat(weekQuote.split(',')[4]));
		},
		error: function(xhr, errType, error) {
			alert("Fail to get previous index quote for " + stock);
		}
	});
}
