import styled from 'styled-components';

export const Background = styled.div`
    background-color: ${props => props.background_color || "#a29bfe"}
    width: 100vw;
    height: 100vh;
    display:flex;
    padding: 30px;
    box-sizing: border-box;
    flex-direction:column;
    align-items: center;
    margin: 0;
`;

export const Title = styled.h1`
    color: #fff;
`;

export const Button = styled.button`
    border: none;
    padding: 15px 15px;
    background-color: ${props => props.active ? props.active_color || "#ffeaa7" : "#2c3e50"};
    color: ${props => props.active ? "#2c3e50" : "#fff"}
    border-radius: 10px;
    font-size:12pt;
    max-width: 430px;
    width: 100%;
    margin: 0;
    display:block;
`;

export const Input = styled.input`
    padding: 15px 15px;
    border-radius: 10px;
    max-width: 400px;
    width:calc(100% - 30px);
    border:none;
    margin-bottom: 10px;
    font-size: 12pt;
`;