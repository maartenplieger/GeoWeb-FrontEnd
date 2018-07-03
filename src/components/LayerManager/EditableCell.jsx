import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import Icon from 'react-fa';

export default class EditableCell extends PureComponent {
  render () {

    return(<ConcreteCell onClick={this.props.onClick} active={this.props.active} color={this.props.color}>
      {this.props.children}&nbsp;
      <Icon className={'LMEditableCell'} id={this.props.id} name='pencil' />
    </ConcreteCell>)
  }
}
