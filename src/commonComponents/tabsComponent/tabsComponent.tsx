import React, { useState, useEffect } from 'react'
import './tabComponent.css' // Import the CSS file

interface TabbedInterfaceProps {
  numberOfTabs: number
  tabContent: any
  tabNames: any
}

const TabbedInterface: React.FC<TabbedInterfaceProps> = ({
  numberOfTabs,
  tabContent,
  tabNames,
}) => {
  const [activeTab, setActiveTab] = useState(0)
  const [tabs, setTabs] = useState(tabContent)

  const handleTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex)
  }
  useEffect(() => {
    setTabs(tabContent)
  }, [tabContent])

  const renderTabs = () => {
    const tabClicker = []
    for (let i = 0; i < tabs.length; i++) {
      tabClicker.push(
        <button
          key={i}
          className={i === activeTab ? 'tab-button active' : 'tab-button'}
          onClick={() => handleTabClick(i)}
        >
          {tabNames[i]}
        </button>,
      )
    }
    return tabClicker
  }

  const renderTabContent = () => {
    let renderedtabs = []
    for (let i = 0; i < tabs.length; i++) {
      renderedtabs[i] = (
        <div
          key={i}
          className={`tab-content ${i === activeTab ? 'active' : ''}`}
        >
          {tabs[i]}
        </div>
      )
    }
    return renderedtabs
  }

  return (
    <div className='tabbed-interface'>
      <div className='tab-buttons'>{renderTabs()}</div>
      <div className='tab-contents'>{renderTabContent()}</div>
    </div>
  )
}

export default TabbedInterface
