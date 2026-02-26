import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Management() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', groupIds: [] });

  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', permissions: [] });

  const [showGroupMembers, setShowGroupMembers] = useState(null);

  const [domains, setDomains] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [showEditDomain, setShowEditDomain] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [newDomain, setNewDomain] = useState({ name: '', description: '' });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', domain_id: '', description: '' });

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditDays, setAuditDays] = useState('30');

  const domainFrameworks = {
    'ISO 27001': [
      { name: 'A.5 - Organizational Controls', description: 'Information security policies, organization of information security, mobile device policy, segmentation' },
      { name: 'A.6 - People Controls', description: 'Human resource security, screening, termination, responsibilities' },
      { name: 'A.7 - Physical Controls', description: 'Secure areas, equipment security, clear desk and screen' },
      { name: 'A.8 - Technological Controls', description: 'Access control, cryptography, operations security, communications security' }
    ],
    'NIST 800-53': [
      { name: 'AC - Access Control', description: 'Access control family' },
      { name: 'AU - Audit and Accountability', description: 'Audit and accountability family' },
      { name: 'AT - Awareness and Training', description: 'Awareness and training family' },
      { name: 'CM - Configuration Management', description: 'Configuration management family' },
      { name: 'CP - Contingency Planning', description: 'Contingency planning family' },
      { name: 'IA - Identification and Authentication', description: 'Identification and authentication family' },
      { name: 'IR - Incident Response', description: 'Incident response family' },
      { name: 'MA - Maintenance', description: 'Maintenance family' },
      { name: 'MP - Media Protection', description: 'Media protection family' },
      { name: 'PE - Physical and Environmental Protection', description: 'Physical and environmental protection family' },
      { name: 'PL - Planning', description: 'Planning family' },
      { name: 'PS - Personnel Security', description: 'Personnel security family' },
      { name: 'RA - Risk Assessment', description: 'Risk assessment family' },
      { name: 'SA - System and Services Acquisition', description: 'System and services acquisition family' },
      { name: 'SC - System and Communications Protection', description: 'System and communications protection family' },
      { name: 'SI - System and Information Integrity', description: 'System and information integrity family' }
    ],
    'CIS': [
      { name: 'CIS 1 - Inventory and Control of Enterprise Assets', description: 'Actively manage all enterprise assets connected to the infrastructure' },
      { name: 'CIS 2 - Inventory and Control of Software Assets', description: 'Actively manage all software on the network' },
      { name: 'CIS 3 - Data Protection', description: 'Develop processes and controls to identify, classify, handle, retain, and dispose of data' },
      { name: 'CIS 4 - Secure Configuration Management', description: 'Establish and maintain secure configurations for all enterprise assets' },
      { name: 'CIS 5 - Account Management', description: 'Use processes and tools to assign and manage authorization to credentials for user accounts' },
      { name: 'CIS 6 - Access Control Management', description: 'Use processes and tools to create, assign, manage, and revoke access credentials' },
      { name: 'CIS 7 - Continuous Vulnerability Management', description: 'Continuously acquire, assess, and take action on new information in order to identify vulnerabilities' },
      { name: 'CIS 8 - Audit Log Management', description: 'Collect, alert, review, and retain audit logs of events to detect, understand, and recover' },
      { name: 'CIS 9 - Email Web Browser and Protection', description: 'Deploy and maintain email and web browser protections' },
      { name: 'CIS 10 - Malware Defenses', description: 'Deploy and maintain anti-malware capabilities' },
      { name: 'CIS 11 - Data Recovery Capability', description: 'Establish and maintain data recovery practices and capabilities' },
      { name: 'CIS 12 - Network Infrastructure Management', description: 'Design, implement, and manage network architecture' },
      { name: 'CIS 13 - Network Monitoring and Defense', description: 'Operate processes and tools to create and maintain network monitoring and defense' },
      { name: 'CIS 14 - Security Awareness and Skills Training', description: 'Establish and maintain a security awareness program' },
      { name: 'CIS 15 - Application Software Security', description: 'Manage the security life cycle of software' },
      { name: 'CIS 16 - Incident Response Management', description: 'Establish a program to develop and maintain incident response capability' },
      { name: 'CIS 17 - Penetration Testing', description: 'Validate security defenses through controlled attack simulation' },
      { name: 'CIS 18 - Risk Scoring', description: 'Prioritize security improvement actions using a consistent, actionable scoring methodology' }
    ],
    'SOC 2': [
      { name: 'CC1 - Control Environment', description: 'Sets the tone for the organization' },
      { name: 'CC2 - Communication and Information', description: 'Relevant quality information is obtained and shared' },
      { name: 'CC3 - Risk Assessment', description: 'Risks are identified and analyzed' },
      { name: 'CC4 - Monitoring Activities', description: 'Ongoing evaluations to ascertain internal controls' },
      { name: 'CC5 - Control Activities', description: 'Policies and procedures are executed as designed' },
      { name: 'CC6 - Logical and Physical Access Controls', description: 'Access to both logical and physical assets is restricted' },
      { name: 'CC7 - System Operations', description: 'Systems are operated to meet objectives' },
      { name: 'CC8 - Change Management', description: 'Changes to system components are managed' },
      { name: 'CC9 - Risk Mitigation', description: 'Risk mitigation processes are implemented' }
    ]
  };

  const [permissions] = useState([
    { id: 1, name: 'View Risks', description: 'View all risks in the register', key: 'read' },
    { id: 2, name: 'Edit Risks', description: 'Create, modify and delete risks', key: 'write' },
    { id: 3, name: 'Manage Users', description: 'Add, remove and manage users', key: 'admin' },
    { id: 4, name: 'Export Data', description: 'Export risks to CSV', key: 'export' },
    { id: 5, name: 'View Reports', description: 'Access dashboard and reports', key: 'reports' },
    { id: 6, name: 'Manage Controls', description: 'Manage controls and mappings', key: 'controls' },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const auditData = await api.get(`/meta/audit-logs?days=${auditDays}`);
        setAuditLogs(auditData);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      }
    };
    loadAuditLogs();
  }, [auditDays]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, groupsData, domainsData, categoriesData, auditData] = await Promise.all([
        api.get('/auth/users'),
        api.get('/auth/groups'),
        api.get('/meta/domains'),
        api.get('/meta/categories'),
        api.get(`/meta/audit-logs?days=${auditDays}`)
      ]);
      setUsers(usersData);
      setGroups(groupsData);
      setDomains(domainsData);
      setCategories(categoriesData);
      setAuditLogs(auditData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post('/auth/register', newUser);
      setShowAddUser(false);
      setNewUser({ email: '', password: '', name: '', groupIds: [] });
      loadData();
    } catch (error) {
      console.error('Failed to add user:', error);
      alert(error.message);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ 
      ...user, 
      groupIds: user.groups?.map(g => g.id) || [] 
    });
    setShowEditUser(true);
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`/auth/users/${editingUser.id}`, {
        name: editingUser.name,
        groupIds: editingUser.groupIds,
        password: editingUser.password || undefined
      });
      setShowEditUser(false);
      setEditingUser(null);
      loadData();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const userId = parseInt(id);
    console.log('Deleting user:', userId);
    try {
      const result = await api.delete(`/auth/users/${userId}`);
      console.log('Delete result:', result);
      if (result.success) {
        loadData();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete user');
    }
  };

  const handleAddDomain = async () => {
    try {
      await api.post('/meta/domains', newDomain);
      setShowAddDomain(false);
      setNewDomain({ name: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Failed to add domain:', error);
      alert(error.message);
    }
  };

  const handleEditDomain = (domain) => {
    setEditingDomain({ ...domain });
    setShowEditDomain(true);
  };

  const handleUpdateDomain = async () => {
    try {
      await api.put(`/meta/domains/${editingDomain.id}`, {
        name: editingDomain.name,
        description: editingDomain.description
      });
      setShowEditDomain(false);
      setEditingDomain(null);
      loadData();
    } catch (error) {
      console.error('Failed to update domain:', error);
    }
  };

  const handleDeleteDomain = async (id) => {
    if (!confirm('Are you sure? This will also delete all categories in this domain.')) return;
    try {
      await api.delete(`/meta/domains/${id}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete domain:', error);
      alert(error.message);
    }
  };

  const handleLoadFramework = async (framework) => {
    if (!confirm(`This will add all ${framework} categories. If the domain exists, categories will be added to it. Continue?`)) return;
    try {
      let domainId;
      const existingDomain = domains.find(d => d.name === framework);
      
      if (existingDomain) {
        domainId = existingDomain.id;
      } else {
        const result = await api.post('/meta/domains', { name: framework, description: `${framework} framework` });
        domainId = result.id;
      }
      
      for (const category of domainFrameworks[framework]) {
        try {
          await api.post('/meta/categories', { name: category.name, domain_id: domainId, description: category.description });
        } catch (e) {
          // Skip duplicates
        }
      }
      loadData();
    } catch (error) {
      console.error('Failed to load framework:', error);
      alert(error.message);
    }
  };

  const handleAddCategory = async () => {
    try {
      await api.post('/meta/categories', newCategory);
      setShowAddCategory(false);
      setNewCategory({ name: '', domain_id: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert(error.message);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category, domain_id: category.domain_id || category.domain_id });
    setShowEditCategory(true);
  };

  const handleUpdateCategory = async () => {
    try {
      await api.put(`/meta/categories/${editingCategory.id}`, {
        name: editingCategory.name,
        domain_id: editingCategory.domain_id,
        description: editingCategory.description
      });
      setShowEditCategory(false);
      setEditingCategory(null);
      loadData();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/meta/categories/${id}`);
      loadData();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.message);
    }
  };

  const handleAddGroup = async () => {
    try {
      await api.post('/auth/groups', newGroup);
      setShowAddGroup(false);
      setNewGroup({ name: '', description: '', permissions: [] });
      loadData();
    } catch (error) {
      console.error('Failed to add group:', error);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup({ ...group });
    setShowEditGroup(true);
  };

  const handleUpdateGroup = async () => {
    try {
      await api.put(`/auth/groups/${editingGroup.id}`, {
        name: editingGroup.name,
        description: editingGroup.description,
        permissions: editingGroup.permissions
      });
      setShowEditGroup(false);
      setEditingGroup(null);
      loadData();
    } catch (error) {
      console.error('Failed to update group:', error);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Are you sure you want to delete this group? All users will be removed from this group.')) return;
    const groupId = parseInt(id);
    console.log('Deleting group:', groupId);
    try {
      const result = await api.delete(`/auth/groups/${groupId}`);
      console.log('Delete group result:', result);
      if (result.success) {
        loadData();
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert(error.message || 'Failed to delete group');
    }
  };

  const handleRemoveUserFromGroup = async (groupId, userId) => {
    try {
      await api.delete(`/auth/groups/${groupId}/users/${userId}`);
      loadData();
    } catch (error) {
      console.error('Failed to remove user from group:', error);
    }
  };

  const handleAddUserToGroup = async (groupId, userId) => {
    try {
      await api.post(`/auth/groups/${groupId}/users`, { userId });
      loadData();
    } catch (error) {
      console.error('Failed to add user to group:', error);
    }
  };

  const togglePermission = (item, permKey) => {
    const updated = { ...item };
    if (updated.permissions.includes(permKey)) {
      updated.permissions = updated.permissions.filter(p => p !== permKey);
    } else {
      updated.permissions = [...updated.permissions, permKey];
    }
    return updated;
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'groups', label: 'Groups', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'domains', label: 'Domains & Categories', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'permissions', label: 'Permissions', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { id: 'audit', label: 'Audit Trail', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Management</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">Manage users, groups, and permissions</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50">
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">User</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Groups</th>
                  <th className="text-left p-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Created</th>
                  <th className="text-right p-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(4)].map((_, j) => (
                        <td key={j} className="p-4">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500 dark:text-slate-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-medium">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.groups?.length > 0 ? (
                            user.groups.map((group) => (
                              <span key={group.id} className="px-2 py-1 rounded-md text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                                {group.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-400">No group</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'groups' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Group Management</h2>
            <button 
              onClick={() => setShowAddGroup(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <div 
                key={group.id} 
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                      <button
                        onClick={() => handleEditGroup(group)}
                        className="p-1 rounded text-gray-400 hover:text-primary-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="p-1 rounded text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{group.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <button
                    onClick={() => setShowGroupMembers(showGroupMembers === group.id ? null : group.id)}
                    className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {group.members?.length || 0} members
                    </span>
                    <svg className={`w-4 h-4 transition-transform ${showGroupMembers === group.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <AnimatePresence>
                  {showGroupMembers === group.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Members</p>
                          <select
                            className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleAddUserToGroup(group.id, parseInt(e.target.value));
                              e.target.value = '';
                            }}
                          >
                            <option value="">+ Add user</option>
                            {users.filter(u => !group.members?.find(m => m.id === u.id)).map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {group.members?.length > 0 ? (
                            group.members.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-slate-700">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center text-xs font-medium">
                                    {member.name?.charAt(0)}
                                  </div>
                                  <span className="text-sm text-gray-700 dark:text-slate-300">{member.name}</span>
                                </div>
                                <button
                                  onClick={() => handleRemoveUserFromGroup(group.id, member.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400">No members</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {group.permissions?.map((perm) => (
                      <span key={perm} className="px-2 py-1 rounded-md text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'domains' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Domains & Categories</h2>
            <div className="flex gap-2 items-center">
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) handleLoadFramework(e.target.value);
                    e.target.value = '';
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white pr-8"
                  defaultValue=""
                >
                  <option value="">Load Framework...</option>
                  {Object.keys(domainFrameworks).map(fw => (
                    <option key={fw} value={fw}>{fw}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAddDomain(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Domain
              </button>
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Category
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Domains</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[250px] overflow-y-auto">
                {domains.map((domain) => (
                  <div key={domain.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{domain.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{domain.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditDomain(domain)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDomain(domain.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {domains.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-slate-400">No domains yet</div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-slate-700 max-h-[300px] overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/50">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{category.name}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">{category.domain_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-slate-700"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="p-8 text-center text-gray-500 dark:text-slate-400">No categories yet</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'permissions' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Permission Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map((perm) => (
              <div key={perm.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-card">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{perm.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{perm.description}</p>
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 font-mono">{perm.key}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Trail</h2>
            <div className="flex items-center gap-3">
              <select
                value={auditDays}
                onChange={(e) => { setAuditDays(e.target.value); }}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
              <select
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Activities</option>
                <option value="risks">Risks</option>
                <option value="users">Users</option>
                <option value="groups">Groups</option>
                <option value="controls">Controls</option>
              </select>
              <button
                onClick={async () => {
                  const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/meta/audit-logs/export?days=${auditDays}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                  });
                  if (response.ok) {
                    const text = await response.text();
                    const blob = new Blob([text], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audit-trail-${new Date().toISOString().split('T')[0]}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {auditLogs.filter(log => auditFilter === 'all' || log.action.includes(auditFilter === 'risks' ? 'risk' : auditFilter === 'users' ? 'user' : auditFilter === 'groups' ? 'group' : auditFilter === 'controls' ? 'control' : '')).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.action.includes('created') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          log.action.includes('updated') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          log.action.includes('deleted') ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {log.user_name || 'System'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">
                        {log.details || (log.risk_title ? `Risk: ${log.risk_title}` : '-')}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-slate-400">
                        No audit logs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showAddUser && (
          <Modal title="Add New User" onClose={() => setShowAddUser(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Min 12 characters, 1 number, 1 special character</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Groups</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={newUser.groupIds.includes(group.id)}
                        onChange={() => {
                          if (newUser.groupIds.includes(group.id)) {
                            setNewUser({ ...newUser, groupIds: newUser.groupIds.filter(id => id !== group.id) });
                          } else {
                            setNewUser({ ...newUser, groupIds: [...newUser.groupIds, group.id] });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                Add User
              </button>
            </div>
          </Modal>
        )}

        {showEditUser && editingUser && (
          <Modal title="Edit User" onClose={() => { setShowEditUser(false); setEditingUser(null); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">New Password (leave blank)</label>
                <input
                  type="password"
                  value={editingUser.password || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Min 12 characters, 1 number, 1 special character</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Groups</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groups.map((group) => (
                    <label key={group.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={editingUser.groupIds.includes(group.id)}
                        onChange={() => {
                          if (editingUser.groupIds.includes(group.id)) {
                            setEditingUser({ ...editingUser, groupIds: editingUser.groupIds.filter(id => id !== group.id) });
                          } else {
                            setEditingUser({ ...editingUser, groupIds: [...editingUser.groupIds, group.id] });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditUser(false); setEditingUser(null); }}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}

        {showAddGroup && (
          <Modal title="Add New Group" onClose={() => setShowAddGroup(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={newGroup.permissions.includes(perm.key)}
                        onChange={() => setNewGroup(togglePermission(newGroup, perm.key))}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddGroup(false)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                Add Group
              </button>
            </div>
          </Modal>
        )}

        {showEditGroup && editingGroup && (
          <Modal title="Edit Group" onClose={() => { setShowEditGroup(false); setEditingGroup(null); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={editingGroup.name}
                  onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editingGroup.description}
                  onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissions.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700">
                      <input
                        type="checkbox"
                        checked={editingGroup.permissions?.includes(perm.key)}
                        onChange={() => setEditingGroup(togglePermission(editingGroup, perm.key))}
                        className="rounded border-gray-300 text-primary-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-300">{perm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowEditGroup(false); setEditingGroup(null); }}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGroup}
                className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
              >
                Save Changes
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddDomain && (
          <Modal title="Add New Domain" onClose={() => setShowAddDomain(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Domain Name</label>
                <input
                  type="text"
                  value={newDomain.name}
                  onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newDomain.description}
                  onChange={(e) => setNewDomain({ ...newDomain, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddDomain(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDomain}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                >
                  Add Domain
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showEditDomain && editingDomain && (
          <Modal title="Edit Domain" onClose={() => setShowEditDomain(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Domain Name</label>
                <input
                  type="text"
                  value={editingDomain.name}
                  onChange={(e) => setEditingDomain({ ...editingDomain, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editingDomain.description}
                  onChange={(e) => setEditingDomain({ ...editingDomain, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditDomain(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDomain}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showAddCategory && (
          <Modal title="Add New Category" onClose={() => setShowAddCategory(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Domain</label>
                <select
                  value={newCategory.domain_id}
                  onChange={(e) => setNewCategory({ ...newCategory, domain_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Domain</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                >
                  Add Category
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showEditCategory && editingCategory && (
          <Modal title="Edit Category" onClose={() => setShowEditCategory(false)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Domain</label>
                <select
                  value={editingCategory.domain_id}
                  onChange={(e) => setEditingCategory({ ...editingCategory, domain_id: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Domain</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditCategory(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary-500 text-white hover:bg-primary-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 dark:bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
        {children}
      </motion.div>
    </motion.div>
  );
}
