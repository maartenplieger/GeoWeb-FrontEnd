import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ChangeSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.map(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }
    return <Row className='Change'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Change</Badge>
          </Col>
          <Col xs='9'>
            {children.change}
            {children.change && children.change.props.selected
              ? <span className={children.change.props.selected.length > 0 ? 'required' : 'required missing'} />
              : null
            }
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

ChangeSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
};
