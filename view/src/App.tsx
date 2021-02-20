import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
const VOWEL_SYMBOL = '_'
const CONSONANT_SYMBOL = '$'
// const pattern = '_$_$'
// const pattern = '$_$_'
const pattern = '$__$'
const patternMatch = (str: string, pattern: string) => {
  for (let i = 0; i < pattern.length; i++) {
    const letter = str[i]
    const pat = pattern[i]
    if (pat === CONSONANT_SYMBOL) {
      if (!isConsonant(letter)) {
        return false
      }
    } else if (pat === VOWEL_SYMBOL) {
      if (!isVowel(letter)) {
        return false
      }
    } else if (letter !== pat) {
      return false
    }
  }
  return true
}
const isVowel = (letter:string) => (
  letter.length === 1 && ['a','e','i','o','u','y'].includes(letter)
)
const isConsonant = (letter:string) => !isVowel(letter)
const priceToNumber = (price:string) => {
  const priceArr = price.split('')
  const result = []
  for (const letter of priceArr) {
    if (/[0-9]/.test(letter)) {
      result.push(letter)
    }
  }
  return Number(result.join(''))
}
function App() {
  const [domains, setDomains] = useState<{
    name: string
    price: string
  }[]>([])
  useEffect(() => {
    ;(async() => {
      const resp = await fetch('/domains.json')
      const domains = await resp.json()
      setDomains(domains)
    })()
  }, [])
  const filtered = domains.filter(domain => {
    const { name, price } = domain
    return patternMatch(name, pattern)
      && priceToNumber(price) < 10000
  })
  return (
    <div className="App">
      <table>
        <tbody>
        {filtered.map(domain => {
          return (
            <tr>
              <td>{domain.name}</td>
              <td>{domain.price}</td>
            </tr>
          )
        })}
        </tbody>
      </table>
    </div>
  );
}

export default App;

(window as any).WebSocket = undefined