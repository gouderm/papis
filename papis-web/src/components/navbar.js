import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

function PapisNavbar() {
  return (
    <Navbar bg="light" style={{height:"42px"}}>
      <Container fluid>
        <Navbar.Brand href="#home">Papis</Navbar.Brand>
        
        <div className='d-flex'>
          <Nav>
            <Nav.Link href="#home">Add Paper</Nav.Link>
            <Nav.Link href="#link">Settings</Nav.Link>
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}

export default PapisNavbar;