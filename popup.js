document.addEventListener('DOMContentLoaded', function() {
  console.log('Popup loaded');

  const spinner = document.getElementById('loadingSpinner');

  function showSpinner() {
    spinner.style.display = 'block';
  }

  function hideSpinner() {
    spinner.style.display = 'none';
  }

  // Example usage: simulate sending state
  showSpinner();
  setTimeout(() => {
    hideSpinner();
    alert('Data sent successfully!');
  }, 3000); // Simulate a 3-second send
});