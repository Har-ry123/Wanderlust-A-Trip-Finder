(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      },
       false
    );
    });
  })();

const taxToggle = document.getElementById('flexSwitchCheckDefault');
const listingPrices = document.querySelectorAll('.listing-price');

taxToggle.addEventListener('change', () => {
    if (taxToggle.checked) {
        for (let priceElement of listingPrices) {
            let originalPrice = parseFloat(priceElement.getAttribute('data-price'));
            let taxAmount = originalPrice * 0.18;
            let finalPrice = originalPrice + taxAmount;
            priceElement.innerHTML = `&#8377 ${finalPrice.toLocaleString("en-IN")} <i class="fa-solid fa-circle-plus tax-info"></i>`;
        }
    } else {
        for (let priceElement of listingPrices) {
            let originalPrice = parseFloat(priceElement.getAttribute('data-price'));
            priceElement.innerHTML = `&#8377 ${originalPrice.toLocaleString("en-IN")}`; 
        }
    }
});