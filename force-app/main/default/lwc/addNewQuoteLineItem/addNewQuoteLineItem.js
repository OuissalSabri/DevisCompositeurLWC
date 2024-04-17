import { LightningElement , wire, track, api} from 'lwc';
import addQuoteLineItem from '@salesforce/apex/DevisController.addQuoteLineItem';
import getProductSalesPrice from '@salesforce/apex/DevisController.getProductSalesPrice';
import getProducts from '@salesforce/apex/DevisController.getProducts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
export default class AddNewQuoteLineItem extends LightningElement {

    @api value = '';
    @api wiredQuoteItemsResult;
    @api showAddFormButton = false;
    @track showAddForm = false;
    @track selectedProductId = 'None';
    @track productOptions = [];
    @track discount = 0;
    @track quantity = '';
    @track unitPrice = '';
    handleAdd() {
        
        if (!this.value || !this.selectedProductId || isNaN(parseFloat(this.discount)) || isNaN(parseFloat(this.quantity)) || isNaN(parseFloat(this.unitPrice))) {
            console.error('Certains champs obligatoires ne sont pas renseignés ou contiennent des valeurs invalides.');
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'Veuillez saisir des nombres valides pour les champs de Remise, Quantité et Prix unitaire.',
                variant: 'error'
            });
            this.dispatchEvent(event);
            return;
        }
    
        
        const newQuoteLineItem = {
            quoteId: this.value,
            productId: this.selectedProductId,
            discount: this.discount,
            quantity: this.quantity,
            unitPrice: this.unitPrice
        };
    
        
        addQuoteLineItem(newQuoteLineItem)
            .then(result => {
      
                
                console.log('Selected Product Id:',this.selectedProductId);
                console.log('2 ',this.discount);
                console.log('3 ',this.quantity);
                console.log('4 ',this.unitPrice);
                console.log('New Quote Line Item created: ', result);
                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Un nouvel élément de devis a été créé avec succès.',
                    variant: 'success'
                });
                this.dispatchEvent(event);

                refreshApex(this.wiredQuoteItemsResult);
                 
                 this.selectedProductId = 'None';
                 this.discount = '';
                 this.quantity = '';
                 this.unitPrice = '';
                 this.hideAddForm();
                
            })
            .catch(error => {
            
                
                console.error('Error creating Quote Line Item: ', error);
               
            });
    
       
    }
    
    hideAddForm() {
        this.selectedProductId = 'None';
        this.discount = '';
        this.quantity = '';
        this.unitPrice = '';
        this.showAddForm = false;}

    
handleInputChangeAddItemQuote(event) {
    this[event.target.name] = event.target.value;
}
handleProductNameChange(event) {
    this.selectedProductId = event.detail.value;
    console.log('Selected Product Id:', this.selectedProductId);
    
    this.getProductListPrice(this.selectedProductId , this.value)
            .then(price => {
                this.unitPrice = price;
                this.discount = 0; 
                
            })
            .catch(error => {
                console.error('Error fetching product list price:', error);
            });
            
   
}
getProductListPrice(productId , quoteId) {
    return new Promise((resolve, reject) => {
       
       getProductSalesPrice({ productId: productId , quoteId: quoteId})
            .then(result => {
                resolve(result);
            })
            .catch(error => {
                reject(error);
            });
    });
}
@wire (getProducts) wiredproducts({error , data}){
    if (data) {
        this.productOptions = [{ label: 'None', value: 'None' }];
        data.forEach(item => {
            this.productOptions.push({ label: item.Name, value: item.Id });
        });
    } else if (error) {
        console.error('Error retrieving products:', error);
    }   
}
displayAddForm() {
    this.showAddForm = true;
}
}