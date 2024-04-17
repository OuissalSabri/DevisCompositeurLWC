import { LightningElement, wire, track, api } from 'lwc';
import fetchNoSendRecords from '@salesforce/apex/DevisController.fetchNoSendRecords';
import updateQuoteLineItems from '@salesforce/apex/DevisController.updateQuoteLineItems';
import getRelatedQuotesItems from '@salesforce/apex/DevisController.getRelatedQuotesItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getProducts from '@salesforce/apex/DevisController.getProducts';
import addQuoteLineItem from '@salesforce/apex/DevisController.addQuoteLineItem';
import {refreshApex} from '@salesforce/apex';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import PRODUCT_OBJECT from '@salesforce/schema/Product2';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import getProductSalesPrice from '@salesforce/apex/DevisController.getProductSalesPrice';
import deleteQuoteLineItem from '@salesforce/apex/DevisController.deleteQuoteLineItem';
import cloneQuoteLineItem from '@salesforce/apex/DevisController.cloneQuoteLineItem';
export default class DevisPasEncoreEnvoyes extends LightningElement {
    @track value = 'None';
    @track options = [];
    @track allquoteLinesItems;
    @track wiredQuoteItemsResult;
    @track showAddFormButton = false;
    @track showAddForm = false;
    @track productOptions = [];
    @track selectedProductId = 'None';
    @track discount = 0;
    @track quantity = '';
    @track unitPrice = '';
    @api recordId;
    
    handleModify(event) {
        const itemId = event.target.dataset.id;
        console.log('Modifier clicked for item with Id:', itemId);

        const editedItemIndex = this.allquoteLinesItems.findIndex(item => item.Id === itemId);
        if (editedItemIndex !== -1) {
            const editedItem = { ...this.allquoteLinesItems[editedItemIndex] };
            editedItem.editable = !editedItem.editable;
            this.allquoteLinesItems = [
                ...this.allquoteLinesItems.slice(0, editedItemIndex),
                editedItem,
                ...this.allquoteLinesItems.slice(editedItemIndex + 1)
            ];
        }
    }
    
    handleDelete(event) {
        const quoteLineItemId = event.target.dataset.id;
        deleteQuoteLineItem({ quoteLineItemId: quoteLineItemId })
            .then(result => {
                
                console.log('Quote Line Item deleted successfully');
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Elément de devis a été supprimé avec succès',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
                refreshApex(this.wiredQuoteItemsResult);
                
            })
            .catch(error => {
                
                console.error('Error deleting Quote Line Item:', error);
                
            });
    }
    handleSave(event) {
        const editedItems = this.allquoteLinesItems.filter(item => item.editable);
        const updatePromises = editedItems.map(async editedItem => {
            try {
                const result = await updateQuoteLineItems({ quoteLineItems: [editedItem] });
                return result;
            } catch (error) {
                console.error('Error updating Quote Line Item:', error);
                throw error;
            }
        });

        Promise.all(updatePromises)
            .then(results => {
                console.log('All changes saved successfully');
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Toutes les modifications ont été enregistrées avec succès',
                    variant: 'success'
                });
                this.dispatchEvent(toastEvent);
                this.allquoteLinesItems = this.allquoteLinesItems.map(item => ({ ...item, editable: false }));

               // return refreshApex(this.allquoteLinesItems);
             // location.reload()
             refreshApex(this.wiredQuoteItemsResult);
              
            })
            .catch(error => {
                console.error('Error updating one or more Quote Line Items:', error);
            });
    }


  
    handleInputChange(event) {
        const itemId = event.target.dataset.id;
        const fieldName = event.target.name;
        const value = event.target.value;
    
        const editedItemIndex = this.allquoteLinesItems.findIndex(item => item.Id === itemId);
        if (editedItemIndex !== -1) {
            
            const editedItem = { ...this.allquoteLinesItems[editedItemIndex] };
            if (fieldName === 'Quantity' || fieldName === 'UnitPrice' || fieldName === 'Discount') {
                
                if (isNaN(value)) {
                    
                    const toastEvent = new ShowToastEvent({
                        title: 'Error',
                        message: 'Veuillez entrer un nombre valide',
                        variant: 'error'
                    });
                    this.dispatchEvent(toastEvent);
                    return; 
                }
            }
         
             if (fieldName === 'Quantity') {
                editedItem.Quantity = value;
            } 
            else if (fieldName === 'Discount') {
                editedItem.Discount = value;
            }
            else if (fieldName === 'UnitPrice') {
                editedItem.UnitPrice = value;
            }
    
          
            this.allquoteLinesItems = [
                ...this.allquoteLinesItems.slice(0, editedItemIndex),
                editedItem,
                ...this.allquoteLinesItems.slice(editedItemIndex + 1)
            ];
        }
    }
    handleChange(event) {
        this.value = event.detail.value;
        console.log('Selected Quote Id:', this.value);

    }
/*@wire (getProducts) wiredproducts({error , data}){
    if (data) {
        this.productOptions = [{ label: 'None', value: 'None' }];
        data.forEach(item => {
            this.productOptions.push({ label: item.Name, value: item.Id });
        });
    } else if (error) {
        console.error('Error retrieving products:', error);
    }   
}*/
displayAddForm() {
    this.showAddForm = true;
}

/*hideAddForm() {
    this.selectedProductId = 'None';
    this.discount = '';
    this.quantity = '';
    this.unitPrice = '';
    this.showAddForm = false;


}*/

/*handleProductNameChange(event) {
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
}*/
/*handleAdd() {
   
    if (!this.value || !this.selectedProductId || !this.discount === null || !this.quantity || !this.unitPrice) {
        console.error('Some required fields are not populated.');
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
                message: 'New Quote Line Item created successfully',
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

   
}*/

/*handleInputChangeAddItemQuote(event) {
    this[event.target.name] = event.target.value;
}*/
    @wire(fetchNoSendRecords, { currentRecordId: '$recordId' })
    wiredFetchNoSendRecords({error, data}) {
        if (data) {
            this.options = [{ label: 'None', value: 'None' }];
            data.forEach(item => {
                this.options.push({ label: item.Name, value: item.Id });
            });
        } else if (error) {
            console.error('Error retrieving quotes:', error);
        }
    }

    @wire(getRelatedQuotesItems, { quoteId: '$value' })
    wiredGetRelatedQuotesItems(result) {
        if (this.value && this.value !== 'None') {
            this.wiredQuoteItemsResult = result;
            const { data, error } = result;
            if (data) {
                this.showAddFormButton = true;
                this.allquoteLinesItems = data.map(item => ({
                    ...item,
                    editable: false,
                    ListPriceFormatted: item.ListPrice ?  item.ListPrice + '€'  : '',
                    UnitPriceFormatted: item.UnitPrice ?  item.UnitPrice + '€': '',
                    DiscountFormatted: item.Discount ? item.Discount + '%':'',
                    TotalPriceFormatted : item.TotalPrice ? item.TotalPrice + '€'  : '',
                    SubtotalFormatted : item.Subtotal ? item.Subtotal + '€'  : ''
                }));
                console.log('quotelinesitems renvoyés');
            } else if(error) {
                console.error('Error retrieving related quote items:', error);
        }
    }
}


handleClone(event) {
    const itemId = event.target.dataset.id;
    cloneQuoteLineItem({ quoteLineItemId: itemId })
        .then(clonedQuoteLineItemId => {
           
            const originalIndex = this.allquoteLinesItems.findIndex(item => item.Id === itemId);
            
            const clonedItem = { ...this.allquoteLinesItems[originalIndex] };
            clonedItem.Id = clonedQuoteLineItemId; 
            this.allquoteLinesItems.splice(originalIndex, 0, clonedItem);
            console.log('Quote Line Item cloned successfully');
            const toastEvent = new ShowToastEvent({
                title: 'Success',
                message: 'Elément de devis a été cloné avec succès',
                variant: 'success'
            });
            this.dispatchEvent(toastEvent);
        
        })
        .catch(error => {
          
            console.error('Error cloning Quote Line Item:', error);
            const toastEvent = new ShowToastEvent({
                title: 'Error',
                message: 'Erreur lors du clonage de élément de devis: ' + error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(toastEvent);
        });
}

}
