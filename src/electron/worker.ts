console.log(require.resolve('typescript/lib/tsc'));

process.on('disconnect', () => {
	process.exit(1);
});

function handleJob(job: string, argument: string[]) {
	switch (job) {
		case 'tsc':
			process.argv = [process.argv0, process.env.MAIN_FILE, ...argument];
			require('typescript/lib/tsc');
			break;
		default:
			console.error('unknown job: %s', job);
			process.exit(1);
	}
}

let dispose = (() => {
	const die = setTimeout(() => {
		console.log('do not get any command');
		process.exit(1);
	}, 10000);
	const ready = setInterval(send, 5000);

	send();

	function send() {
		process.send(['init', '']);
	}

	return () => {
		clearTimeout(die);
		clearInterval(ready);
		dispose = null;
	};
})();

process.on('message', (data) => {
	if (!Array.isArray(data)) {
		return;
	}
	const [action, argument] = data;

	switch (action) {
		case 'run':
			console.log('\x1B[1;38;5;14m%s\x1B[0m', argument.join(' '));
			dispose();
			const job = argument.shift();
			handleJob(job, argument);
	}
});
