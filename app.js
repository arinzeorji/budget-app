//BUDGET CONTROLLER
var budgetController = (() => {

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {

        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = (type) => {
        var sum = 0;

        data.allItems[type].forEach((element) => {
            sum += element.value;
        });
        data.totals[type] = sum;
    }


    return {
        addItem: (type, desc, val) => {
            var newItem, ID;
            // create the new next ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                ID = 0;
            }

            //create a new item on either 'inc' or 'exp'
            if (type === 'inc') {
                newItem = new Income(ID, desc, val)

            } else if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
            }

            //push new item to data structure 
            data.allItems[type].push(newItem);

            //return the new item
            return newItem;
        },

        deleteItem: (type, id) => {
            var ids, index;
            ids = data.allItems[type].map((current) => {
                return current.id;
            })
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: () => {

            //calculate total income/ expense
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {

            data.allItems.exp.forEach(function (current) {
                current.calcPercentage(data.totals.inc)
            });
        },

        getPercentages: function () {
            var allPerc;
            allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentage();
            });
            return allPerc;
        },

        getBudget: () => {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            };
        },

        testingApp: () => {
            console.log(data);
        }
    }

})();




//USER INTERFACE CONTROLLER
var UIController = (() => {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeClass: '.income__list',
        expenseClass: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        monthLabel: '.budget__title--month'

    };

    formatNumber = function (num, type) {

        var numSplit, int, dec;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);

        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);

        }
    }

    return {
        getUI_inputFunction: () => {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        deleteItemList: (selectedItem) => {
            var element = document.getElementById(selectedItem);
            element.parentNode.removeChild(element);
        },

        displayMonth: () => {
            var now, month, months, year;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;

        },

        changedTyped: () => {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
        },

        clearFields: () => {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(element => {
                element.value = "";
            });

            fieldsArray[0].focus();

        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensePercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })
        },

        getDomStrings: () => {
            return DOMstrings;
        },

        displayBudget: (budgetObj) => {

            // if (budgetObj.budget === 0) {
            //     document.querySelector(DOMstrings.budgetLabel).textContent = budgetObj.budget;
            // } else if (budgetObj.budget < 0) {
            //     document.querySelector(DOMstrings.budgetLabel).textContent = budgetObj.budget;
            // } else {
            //     document.querySelector(DOMstrings.budgetLabel).textContent =  budgetObj.budget;
            // }

            var type;
            budgetObj > 0 ? type = 'inc' : 'exp'

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budgetObj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(budgetObj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(budgetObj.totalExpenses, 'exp');

            if (budgetObj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budgetObj.percentage + '%';

            } else {
                budgetObj.percentage = '--%';
            }

        },

        addItemToUI: (obj, type) => {

            var html, newHtml, element;
            if (type === 'inc') {
                element = DOMstrings.incomeClass;
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">
                        %description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline">GO</i></button></div></div></div >`;

            } else if (type === 'exp') {
                element = DOMstrings.expenseClass;
                html = `<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>
                        <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>
                        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">GO</i></button> </div></div></div>`;
            }

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        }
    }
})();

var appController = ((budgetControl, UIControl) => {
    const getDom = UIControl.getDomStrings();

    const setupEventListeners = () => {
        document.querySelector(getDom.inputBtn).addEventListener('click', addItemFunction);

        document.addEventListener('keypress', (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                addItemFunction();
            }
        })
        document.querySelector(getDom.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(getDom.inputType).addEventListener('change', UIControl.changedTyped);
    }

    var updateBudget = () => {
        var budget;

        // 1 calculate the budget
        budgetControl.calculateBudget()

        //2. return the budget total
        budget = budgetControl.getBudget();

        //3. display budget total to UI
        // console.log(budget);
        UIControl.displayBudget(budget);
    }

    var updatePercentages = () => {

        budgetControl.calculatePercentages();

        var percents = budgetControl.getPercentages();

        // console.log('the percent is ' + percents);
        UIControl.displayPercentages(percents);

    }

    const ctrlDeleteItem = (event) => {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
        }

        //1. delete item from data structure
        budgetControl.deleteItem(type, ID);

        //2. remove item from UI
        UIControl.deleteItemList(itemID);

        // 3, update the budget
        updateBudget();

        //calculate and update percentages
        updatePercentages();
    }

    const addItemFunction = () => {
        var input, newItem;
        //1. get items value from UI

        input = UIControl.getUI_inputFunction();

        const { type, description, value } = input;
        //console.log(input);

        //To ensure that both the budget description and value are not empty
        if (description !== "" && !isNaN(value) && value > 0) {

            //2. Add the item to the budget controler
            newItem = budgetControl.addItem(type, description, value);

            // 3.1 Add the item to the UI 
            UIControl.addItemToUI(newItem, input.type);

            //3.2 Clear all input fields
            UIControl.clearFields();

            // 4. Calculate the budget
            updateBudget();

            // 5, calculate and Display the percentages.
            updatePercentages();
        }
    }

    return {
        initFunction: () => {
            console.log('app has started');

            UIControl.displayMonth();

            UIControl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

appController.initFunction();