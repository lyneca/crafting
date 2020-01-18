import React from 'react';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            recipeNames: [
                "piston",
                "pistons",
                "wood planks"
            ],
            recipes: {
                piston: {
                    name: "Piston",
                    count: 1,
                    ingredients: [
                        { name: "redstone", count: 1 },
                        { name: "cobblestone", count: 4 },
                        { name: "iron ingot", count: 1 },
                        { name: "wood planks", count: 3 },
                    ]
                },
                "wood planks": {
                    name: "Wood Planks",
                    count: 4,
                    ingredients: [
                        { name: "wood log", count: 1 }
                    ]
                },
                "pistons": {
                    name: "Pistons",
                    count: 3,
                    ingredients: [
                        { name: "piston", count: 4 }
                    ]
                }
            },
            inventory: {}
        }
    }

    getRecipes() {
        return this.state.recipeNames.map(r => <Recipe key={r} recipe={this.state.recipes[r]} state={this.state} />);
    }

    render() {
        return (
            <div className="App">
                <Sidebar />
                <div className="header">
                    <input type="text" id="new-recipe" placeholder="I want to make..." />
                </div>
                <div className="recipes">
                    {this.getRecipes()}
                </div>
            </div>
        );
    }
}

class Sidebar extends React.Component {
    render() {
        return (
            <div className="sidebar">
                <div className="sidebar-header">Inventory</div>
                <div className="sidebar-table"></div>
            </div>
        );
    }
}

function getComputedIngredients(recipe, recipeNames, recipes) {
    let out = [];
    for (let item of recipe.ingredients) {
        if (recipeNames.includes(item.name)) {
            out = out.concat(getComputedIngredients(recipes[item.name], recipeNames, recipes)
                .map(dep => {
                    console.log(dep.count, item.count, recipe.count)
                    return { name: dep.name, count: dep.count * Math.ceil(item.count / recipes[item.name].count) }
                })
            )
        }
        else {
            out.push(item);
        }
    }
    return out;
}
    

class Recipe extends React.Component {
    constructor(props) {
        super(props);
    }

    getComputedIngredients() {
        return getComputedIngredients(this.props.recipe, this.props.state.recipeNames, this.props.state.recipes)
            .map(i => <Ingredient key={i.name} ingredient={i} />);
    }

    getBaseIngredients() {
        return this.props.recipe.ingredients.map(item => <Ingredient key={item.name} ingredient={item} />);
    }
    
    render() {
        return (
            <div className="recipe">
                <div className="recipe-header">{this.props.recipe.count}x {this.props.recipe.name}</div>
                <div className="computed-ingredients">
                    <div className="ingredients-list-title">Computed</div>
                    {this.getComputedIngredients()}
                </div>
                <div className="recipe-ingredients">
                    <div className="ingredients-list-title">Base</div>
                    {this.getBaseIngredients()}
                </div>
            </div>
        );
    }
}

class Ingredient extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="ingredient">
                <span className="ingredient-name">{this.props.ingredient.name}</span>
                <span className="ingredient-count">{this.props.ingredient.count}</span>
            </div>
        );
    }
}

export default App;
