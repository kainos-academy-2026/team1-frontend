(() => {
	var forms = document.querySelectorAll('.application-action-form');

	forms.forEach((form) => {
		form.addEventListener('submit', (event) => {
			var message = form.getAttribute('data-confirm-message');
			if (!message) {
				return;
			}

			if (!window.confirm(message)) {
				event.preventDefault();
			}
		});
	});
})();
