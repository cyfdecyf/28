function getQuoteFromYahoo(stock, callback) {
    var today = new Date();
    // 考虑到放假可能有一周时间不开盘，为确保能找到过去 4 周的收盘数据，从当前时间起往回 6 周
    // Date 可以用 milisecond 构造，所以将当前时间减去 6 周对应的 milisecond 数
    var startDate = new Date(today - 6*7*24*60*60*1000);
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
	    // 获取 4 周前的收盘价
	    var weekQuote = data.split('\n')[4];
	    callback(parseFloat(weekQuote.split(',')[4]));
	},
	error: function(xhr, errType, error) {
	    alert("Failed to get previous index quote for " + stock);
	}
    });
}

