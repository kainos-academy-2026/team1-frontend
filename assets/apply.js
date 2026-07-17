(() => {
	var form = document.getElementById('apply-form');
	var fileInput = document.getElementById('cv-file');
	var submitBtn = document.getElementById('apply-submit');
	var errorDiv = document.getElementById('apply-error');
	var successDiv = document.getElementById('apply-success');
	var loadingDiv = document.getElementById('apply-loading');
	var jobRoleId = form.querySelector('input[name="jobRoleId"]').value;

	var MAX_FILE_SIZE = 5 * 1024 * 1024;

	function showError(message) {
		errorDiv.textContent = message;
		errorDiv.hidden = false;
		successDiv.hidden = true;
		loadingDiv.hidden = true;
		submitBtn.disabled = false;
	}

	function showSuccess() {
		errorDiv.hidden = true;
		successDiv.hidden = false;
		loadingDiv.hidden = true;
		submitBtn.hidden = true;
		fileInput.disabled = true;
	}

	function showLoading() {
		errorDiv.hidden = true;
		successDiv.hidden = true;
		loadingDiv.hidden = false;
		submitBtn.disabled = true;
	}

	form.addEventListener('submit', (event) => {
		event.preventDefault();

		var file = fileInput.files[0];

		if (!file) {
			showError('Please select a CV file to upload.');
			return;
		}

		if (file.type !== 'application/pdf') {
			showError('Only PDF files are accepted.');
			return;
		}

		if (file.size > MAX_FILE_SIZE) {
			showError('File size must be less than 5MB.');
			return;
		}

		showLoading();

		fetch(`/job-roles/${jobRoleId}/apply`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				fileName: file.name,
				contentType: 'application/pdf',
			}),
		})
			.then((response) => {
				if (!response.ok) {
					return response.json().then((data) => {
						throw new Error(data.error || 'Failed to prepare upload');
					});
				}
				return response.json();
			})
			.then((data) =>
				fetch(data.uploadUrl, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/pdf' },
					body: file,
				}),
			)
			.then((uploadResponse) => {
				if (!uploadResponse.ok) {
					throw new Error('Failed to upload CV. Please try again.');
				}
				showSuccess();
			})
			.catch((error) => {
				showError(error.message || 'Something went wrong. Please try again.');
			});
	});
})();
