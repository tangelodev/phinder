import React, { Component } from 'react';
import './DropdownMenu.css'

class DropdownMenu extends Component {
  constructor() {
    super();

    this.state = {
      showMenu: false,
    };

    this.showMenu = this.showMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  showMenu(event) {
    event.preventDefault();

    this.setState({ showMenu: true }, () => {
      document.addEventListener('click', this.closeMenu);
    });
  }

  closeMenu(event) {


      this.setState({ showMenu: false }, () => {
        document.removeEventListener('click', this.closeMenu);
      });

    
  }

  render() {   

    return (
      <div className="dropdown">
        <div onClick={this.showMenu} className="dropbtn">
          Sort by
          </div>

        {
          this.state.showMenu
            ? (
              <div
                className="dropdown-content"
                ref={(element) => {
                  this.dropdownMenu = element;
                }}
              >
                {this.props.content}
              </div>
            )
            : (
              null
            )
        }
      </div>
    );
  }
}

export default DropdownMenu