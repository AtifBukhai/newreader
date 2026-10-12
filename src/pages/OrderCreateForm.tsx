import { useState } from 'react';
import { useApp } from '../store';
import { useNavigate } from 'react-router-dom';
import type { ValidityType, DurationUnit, Courseware } from '../types';
import { ArrowLeft, ShoppingCart, BookOpen, Users, Calendar, Clock, Search } from 'lucide-react';

export function OrderCreateForm() {
  const { state, dispatch, createOrder } = useApp();
  const navigate = useNavigate();
  
  const [partnerId, setPartnerId] = useState('');
  const [bookId, setBookId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [maxDevices, setMaxDevices] = useState(2);
  const [validityType, setValidityType] = useState<ValidityType>('upon_activation');
  const [validityDuration, setValidityDuration] = useState(90);
  const [validityDurationUnit, setValidityDurationUnit] = useState<DurationUnit>('days');
  const [validUntilDate, setValidUntilDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter courseware that is eligible for ordering
  // Eligible: status is 'available' or 'published'
  const eligibleCourseware = state.courseware.filter(c => 
    c.status === 'available' || c.status === 'published'
  );

  // Filter by search term
  const filteredCourseware = eligibleCourseware.filter(c => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      c.title.toLowerCase().includes(search) ||
      c.author.toLowerCase().includes(search) ||
      c.originalFilename.toLowerCase().includes(search) ||
      (c.isbn13 && c.isbn13.toLowerCase().includes(search))
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!partnerId) {
      setError('Please select a partner');
      return;
    }
    if (!bookId) {
      setError('Please select a book');
      return;
    }
    if (quantity < 1 || quantity > 1000) {
      setError('Quantity must be between 1 and 1000');
      return;
    }
    if (validityType === 'upon_activation' && validityDuration < 1) {
      setError('Please enter a valid duration');
      return;
    }
    if (validityType === 'valid_until_date') {
      if (!validUntilDate) {
        setError('Please select a valid until date');
        return;
      }
      const selectedDate = new Date(validUntilDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate <= today) {
        setError('Valid until date must be in the future');
        return;
      }
    }

    setLoading(true);
    try {
      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      // Calculate validityDays for backward compatibility
      let validityDays = 90; // default
      if (validityType === 'upon_activation') {
        if (validityDurationUnit === 'days') validityDays = validityDuration;
        else if (validityDurationUnit === 'months') validityDays = validityDuration * 30;
        else if (validityDurationUnit === 'years') validityDays = validityDuration * 365;
      } else if (validityType === 'valid_until_date' && validUntilDate) {
        const daysDiff = Math.ceil((new Date(validUntilDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        validityDays = daysDiff;
      }

      const result = await createOrder({
        orderId,
        partnerId,
        bookId,
        quantity,
        validityDays,
        maxDevices,
        status: 'submitted',
        requestedBy: state.currentUser!.id,
        orderDate: new Date().toISOString(),
        validityType,
        ...(validityType === 'upon_activation' && {
          validityDuration,
          validityDurationUnit
        }),
        ...(validityType === 'valid_until_date' && {
          validUntilDate
        })
      });

      if (result.success && result.data) {
        dispatch({ 
          type: 'ADD_NOTIFICATION', 
          payload: { message: `Order ${orderId} created successfully`, type: 'success' } 
        });
        navigate(`/admin/orders/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create order');
      }
    } catch (err) {
      setError('An error occurred while creating the order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/orders')}
          className="p-2 rounded-lg hover:bg-helix-card transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Create Order</h1>
          <p className="text-helix-muted mt-1">Generate access codes for a partner</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-6">
        {error && (
          <div className="bg-helix-danger/10 border border-helix-danger/20 rounded-lg p-4 text-sm text-helix-danger">
            {error}
          </div>
        )}

        {/* Partner Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Partner *
          </label>
          <select
            value={partnerId}
            onChange={e => {
              setPartnerId(e.target.value);
              setBookId(''); // Reset book selection when partner changes
            }}
            className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            required
          >
            <option value="">Select a partner</option>
            {state.partners.filter(p => p.status === 'active').map(partner => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </div>

        {/* Book Selection */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Book *
          </label>
          
          {/* Search Input */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-helix-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-10 pr-4 py-2 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none text-sm"
              disabled={!partnerId}
            />
          </div>

          {/* Courseware Dropdown */}
          <select
            value={bookId}
            onChange={e => setBookId(e.target.value)}
            className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            required
            disabled={!partnerId}
          >
            <option value="">
              {partnerId ? 'Select a book' : 'Select a partner first'}
            </option>
            {filteredCourseware.map((courseware: Courseware) => {
              // Get publisher name if available
              const publisher = state.publishers.find(p => p.id === courseware.publisherId);
              const publisherName = publisher?.name || 'Unknown Publisher';
              
              // Format display text
              let displayText = courseware.title;
              if (publisherName && publisherName !== 'Unknown Publisher') {
                displayText += ` — ${publisherName}`;
              }
              if (courseware.edition) {
                displayText += ` — ${courseware.edition} Edition`;
              }
              if (courseware.isbn13) {
                displayText += ` (${courseware.isbn13})`;
              }
              
              return (
                <option key={courseware.id} value={courseware.id}>
                  {displayText}
                </option>
              );
            })}
          </select>
          
          {/* Status Messages */}
          {partnerId && eligibleCourseware.length === 0 && (
            <p className="text-sm text-helix-warning mt-2">
              No eligible courseware available in the library
            </p>
          )}
          {partnerId && eligibleCourseware.length > 0 && filteredCourseware.length === 0 && (
            <p className="text-sm text-helix-muted mt-2">
              No courseware matches your search
            </p>
          )}
          {!partnerId && (
            <p className="text-xs text-helix-muted mt-2">
              Select a partner to view available courseware
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Number of Access Codes *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(parseInt(e.target.value) || 0)}
            min="1"
            max="1000"
            className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            required
          />
          <p className="text-xs text-helix-muted mt-1">
            Between 1 and 1000 codes
          </p>
        </div>

        {/* Max Devices */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Maximum Devices per Code
          </label>
          <input
            type="number"
            value={maxDevices}
            onChange={e => setMaxDevices(parseInt(e.target.value) || 1)}
            min="1"
            max="10"
            className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
          />
          <p className="text-xs text-helix-muted mt-1">
            How many devices can use each code (1-10)
          </p>
        </div>

        {/* Validity Type - Radio Buttons */}
        <div>
          <label className="block text-sm font-medium mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Access Validity *
          </label>
          <div className="space-y-3">
            {/* Option 1: Upon Activation */}
            <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              validityType === 'upon_activation' 
                ? 'border-helix-primary bg-helix-primary/5' 
                : 'border-helix-border hover:border-helix-primary/50'
            }`}>
              <input
                type="radio"
                name="validityType"
                value="upon_activation"
                checked={validityType === 'upon_activation'}
                onChange={e => setValidityType(e.target.value as ValidityType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Upon Activation
                </div>
                <p className="text-sm text-helix-muted mt-1">
                  Access duration starts when the code is first used
                </p>
                {validityType === 'upon_activation' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-helix-muted mb-1">Duration</label>
                      <input
                        type="number"
                        value={validityDuration}
                        onChange={e => setValidityDuration(parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-helix-muted mb-1">Unit</label>
                      <select
                        value={validityDurationUnit}
                        onChange={e => setValidityDurationUnit(e.target.value as DurationUnit)}
                        className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none"
                      >
                        <option value="days">Days</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Option 2: Valid Until Specific Date */}
            <label className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
              validityType === 'valid_until_date' 
                ? 'border-helix-primary bg-helix-primary/5' 
                : 'border-helix-border hover:border-helix-primary/50'
            }`}>
              <input
                type="radio"
                name="validityType"
                value="valid_until_date"
                checked={validityType === 'valid_until_date'}
                onChange={e => setValidityType(e.target.value as ValidityType)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Valid Until a Specific Date
                </div>
                <p className="text-sm text-helix-muted mt-1">
                  All codes expire on the same date regardless of activation
                </p>
                {validityType === 'valid_until_date' && (
                  <div className="mt-3">
                    <label className="block text-xs text-helix-muted mb-1">Valid Until</label>
                    <input
                      type="date"
                      value={validUntilDate}
                      onChange={e => setValidUntilDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 bg-helix-bg border border-helix-border rounded-lg text-sm focus:border-helix-primary focus:outline-none"
                      required
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* Description (Optional) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-2.5 bg-helix-bg border border-helix-border rounded-lg focus:border-helix-primary focus:outline-none"
            placeholder="Add any notes or description for this order..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="px-6 py-2.5 bg-helix-card text-helix-text rounded-lg hover:bg-helix-border transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-2.5 bg-gradient-to-r from-helix-primary to-helix-primary-light text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Create Order & Generate Codes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
