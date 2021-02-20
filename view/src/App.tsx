import React, { useEffect, useState } from 'react';
import './App.scss';
const PRICE_LIMIT = 10000
const VOWEL_SYMBOL = '_'
const CONSONANT_SYMBOL = '$'
const startPatterns = {
  '_$_$': false,
  '$_$_': true,
  '$__$': false,
  '$_0_': false,
  '$_$2_': false,
  '$_$$_': false,
  '$_11$': false,
}

const patternMatch = (str: string, pattern: string) => {
  if (str.replace('.com', '').length !== pattern.length) {
    return false
  }
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
    } else if (/[0-9]/.test(pat)) {
      if (letter !== str[Number(pat)]) {
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
  const [priceLimit, setPriceLimit] = useState(10000)
  const [newPattern, setNewPattern] = useState("")
  const [patterns, setPatterns] = useState(startPatterns)
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
    const filterPatterns: string[] = []
    for (const [key, value] of Object.entries(patterns)) {
      if (value) {
        filterPatterns.push(key)
      }
    }
    return filterPatterns.some(pattern => patternMatch(name, pattern))
      && priceToNumber(price) < Number(priceLimit)
  })
  return (
    <div className="App">
      <label className="price-limit">
        price limit: <input
          value={priceLimit}
          onChange={(e:any) => {
            if(!Number.isNaN(Number(e.target.value)))
              setPriceLimit(e.target.value)
          }}
          />
      </label>
      <label className="new-pattern">
        new pattern: <input
          value={newPattern}
          onChange={(e:any) => {
              setNewPattern(e.target.value)
          }}
          />
      </label>
      <button className="add-new-pattern" onClick={() => {
        setPatterns({
          ...patterns,
          [newPattern]: true
        })
        setNewPattern("")
      }}>
        Add Pattern
      </button>
      <div className="patterns">
        {Object.entries(patterns).map(([key, value]) => {
          return (
            <label onClick={() => {
              setPatterns({
                ...patterns,
                [key]: !value
              })
            }}>
              <input type="checkbox" checked={value} />
              {key}
            </label>
          )
        })}
      </div>
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